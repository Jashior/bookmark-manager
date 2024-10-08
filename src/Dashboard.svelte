<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { Cog, Moon, Sun, Search, X, ChevronDown } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { colorThief } from './colorThief.js';
  import { darkMode, bookmarks as bookmarksStore, categories as categoriesStore } from './store.js';
  import { Star, Star as StarOutline } from 'lucide-svelte';

  let bookmarks = [];
  let filteredBookmarks = [];
  let categories = [];
  let searchTerm = '';
  let searchInput;
  let highlightedBookmark = null;
  let draggedBookmark = null;
  let dropTarget = null;
  let selectedCategory = 'All';
  let currentCategoryIndex = 0;
  let iconSize = 'small'; // Default icon size

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    const storedCategories = localStorage.getItem('categories');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks).filter(b => !b.hidden);
      layoutBookmarks();
    }
    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    }
    if (searchInput) searchInput.focus();
    const savedSize = localStorage.getItem('iconSize');
    if (savedSize) {
      iconSize = savedSize;
    }
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    // Add wheel event listener for mouse scroll
    window.addEventListener('wheel', handleScroll);

    // Initial layout
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleScroll);
    };
  });

  let containerWidth;
  let containerHeight;

  function handleResize() {
    // Use setTimeout to ensure the new dimensions are captured
    setTimeout(() => {
      containerWidth = window.innerWidth / 2;
      containerHeight = window.innerHeight;
      layoutBookmarks();
    }, 0);
  }

  function layoutBookmarks() {
  const padding = 10;
  const bookmarkWidth = iconSize == 'small' ? 100 : iconSize == 'medium' ? 150 : 200;
  const bookmarkHeight = iconSize == 'small' ? 100 : iconSize == 'medium' ? 150 : 200;

  const numberOfBookmarks = filteredBookmarks.length;

  // Calculate the number of columns and rows
  const columns = Math.min(numberOfBookmarks, Math.floor((containerWidth - padding * 2) / bookmarkWidth));
  const rows = Math.ceil(numberOfBookmarks / columns);

  // Calculate the total width and height required for bookmarks
  const totalBookmarkWidth = columns * bookmarkWidth;
  const totalBookmarkHeight = rows * bookmarkHeight;

  // Calculate the horizontal and vertical centering offsets
  const horizontalOffset = (containerWidth - totalBookmarkWidth) / 2;
  const verticalOffset = 0 // (containerHeight - totalBookmarkHeight) / 2;

  // Calculate horizontal and vertical spacing
  const horizontalSpacing = bookmarkWidth;
  const verticalSpacing = bookmarkHeight;

  // Map bookmarks to their new positions
  filteredBookmarks = filteredBookmarks?.map((bookmark, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    // Adjust positions with centering offsets
    const left = horizontalOffset + col * horizontalSpacing;
    const top = verticalOffset + row * verticalSpacing;

    return { ...bookmark, left, top, index };
  });
}




  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return 'https://via.placeholder.com/64';
    }
  }

  function goToManage() {
    navigate("/manage");
  }

  function toggleDarkMode() {
    darkMode.update(n => !n);
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      if (filteredBookmarks.length === 1) {
        window.open(filteredBookmarks[0].url, '_blank');
      } else if (filteredBookmarks.length === 0) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
      }
    } else if (event.key === 'Backspace') {
      searchTerm = '';
    }
  }

  function clearSearch() {
    searchTerm = '';
    if (searchInput) searchInput.focus();
  }

  function handleDragStart(event, bookmark) {
    draggedBookmark = bookmark;
    event.dataTransfer.setData('text/plain', bookmark.id);
    event.dataTransfer.effectAllowed = 'move';
    document.body.style.cursor = 'move'; // Set the cursor to move when dragging
  }

  function handleDragOver(event, bookmark) {
  event.preventDefault();
  

    event.dataTransfer.dropEffect = 'move'; 
    document.body.style.cursor = 'move';
    dropTarget = bookmark;
}

function handleDragLeave() {
  document.body.style.cursor = ''; // Reset cursor when leaving the drop target
  dropTarget = null;
}

function handleDrop(event) {
  event.preventDefault();

  const draggedIndex = bookmarks.findIndex(b => b.id === draggedBookmark.id);
  const targetIndex = bookmarks.findIndex(b => b.id === dropTarget.id);
  
  bookmarks = bookmarks.filter(b => b.id !== draggedBookmark.id);
  bookmarks.splice(targetIndex, 0, draggedBookmark);
  
  bookmarks = bookmarks.map((bookmark, index) => ({ ...bookmark, index }));
  
  layoutBookmarks();
  bookmarksStore.set(bookmarks);
  
  draggedBookmark = null;
  dropTarget = null;
  document.body.style.cursor = ''; // Reset cursor
}

  function handleScroll(event) {
    if (event.deltaY < 0) {
      // Scroll up, move to previous category
      currentCategoryIndex--;
    } else if (event.deltaY > 0) {
      // Scroll down, move to next category
      currentCategoryIndex++;
    }

    // Wrap around logic for cycling
    if (currentCategoryIndex < 0) {
      currentCategoryIndex = categories.length; // Wrap to "All"
    } else if (currentCategoryIndex > categories.length) {
      currentCategoryIndex = 0; // Wrap to "All"
    }

    let selectedCategory;
    if (currentCategoryIndex === 0) {
      selectedCategory = 'All';
    } else {
      selectedCategory = categories[currentCategoryIndex - 1].name;
    }

    selectCategory(selectedCategory);
  }

  $: {
  filteredBookmarks = bookmarks
    .filter(bookmark =>
      (selectedCategory === 'All' || bookmark.category === selectedCategory) &&
      (bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  
  layoutBookmarks();
}

function selectCategory(name) {
  // Update the selected category
  selectedCategory = name;

  // Determine the index of the selected category
  const index = name === 'All' ? 0 : categories.findIndex(category => category.name === name) + 1;

  // Update the current category index
  currentCategoryIndex = index;
}


  $: highlightedBookmark = filteredBookmarks.length === 1 ? filteredBookmarks[0] : null;
</script>

<svelte:window on:resize={handleResize} on:keydown={handleKeydown}/>

<div class="relative h-screen p-5 flex flex-col justify-center items-center" tabindex="-1">
  <button
    on:click={toggleDarkMode}
    class="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
  >
    {#if $darkMode}
      <Sun size={24} />
    {:else}
      <Moon size={24} />
    {/if}
  </button>

  <button
    on:click={goToManage}
    class="absolute top-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
  >
    <Cog size={24} />
  </button>

  <div class="relative mb-4">
    <input
      bind:this={searchInput}
      bind:value={searchTerm}
      placeholder="Search bookmarks..."
      class="pl-10 pr-10 py-2 w-64 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <Search size={20} class="absolute left-3 top-2 text-gray-400" />
    {#if searchTerm}
      <button
        on:click={clearSearch}
        class="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
    {/if}
  </div>

  <div class="flex flex-wrap gap-2 mb-4">
    <button
      class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
      hover:bg-blue-400 hover:text-white
      dark:hover:bg-blue-600 dark:hover:text-white
      {selectedCategory === 'All' 
        ? 'bg-blue-500 text-white dark:bg-blue-600' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}"  
      on:click={() => selectCategory('All')}
    >
      All Categories
    </button>
    {#each categories as category}
      <button
      class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
      hover:bg-blue-400 hover:text-white
      dark:hover:bg-blue-600 dark:hover:text-white
      {selectedCategory === category.name 
        ? 'bg-blue-500 text-white dark:bg-blue-600' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}"
        on:click={() => selectCategory(category.name)}
      >
        {category.name}
      </button>
    {/each}
  </div>

  <div class="relative w-1/2 h-full" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    {#each filteredBookmarks as bookmark (bookmark.id)}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        class="absolute rounded-lg shadow-lg flex flex-col items-center justify-center p-2 
        transition-all hover:scale-110 hover:z-10 
        {highlightedBookmark && highlightedBookmark.id === bookmark.id ? 'ring-4 ring-blue-500' : ''} 
        {dropTarget && dropTarget.id === bookmark.id ? 'border-2 border-blue-500' : ''} 
        dark:shadow-lg dark:shadow-gray-800 
        {iconSize == 'small' ? 'w-20' : iconSize == 'medium' ? 'w-30' : 'w-40'}
        {iconSize == 'small' ? 'h-20' : iconSize == 'medium' ? 'h-30' : 'h-40'} hover:border-2 border-blue-500"
        style="left: {bookmark.left}px; top: {bookmark.top}px;"
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, bookmark)}
        on:dragover={(e) => handleDragOver(e, bookmark)}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
      <img
        src={getFaviconUrl(bookmark.url)}
        alt={bookmark.title}
        class="{iconSize == 'small' ? 'w-10' : iconSize == 'medium' ? 'w-20' : 'w-20'}
        {iconSize == 'small' ? 'h-10' : iconSize == 'medium' ? 'h-20' : 'h-20'} mb-1"
        on:load={(e) => {
          const color = colorThief.getColor(e.target);
          e.target.closest('a').style.backgroundColor = `rgb(${color.join(',')})`;
          e.target.closest('a').style.color = colorThief.getContrastingColor(color);
        }}
      />
      {#if bookmark.favorite}
        <Star size={16} class="fill-current absolute top-1 right-1 text-yellow-500" />
      {/if}
      <span class="text-xs text-center overflow-hidden overflow-ellipsis">{bookmark.title}</span>
    </a>
    {/each}
  </div>
</div>