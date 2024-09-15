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
  let containerWidth;
  let containerHeight;
  let animationFrameId;
  let iconMovement = 'none';

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    const storedCategories = localStorage.getItem('categories');
    const savedSize = localStorage.getItem('iconSize');
    const savedIconMovement = localStorage.getItem('iconMovement');

    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks).filter(b => !b.hidden);
      layoutBookmarks();
      filteredBookmarks = [...bookmarks];
    }
    if (storedCategories) categories = JSON.parse(storedCategories);
    if (searchInput) searchInput.focus();
    if (savedSize) iconSize = savedSize;
    if (savedIconMovement) iconMovement = savedIconMovement;

    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleScroll);

    handleResize();

    if (iconMovement == 'random') {
      bookmarks = bookmarks.map(initializeBookmark);
      animateBookmarks();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  });

  function initializeBookmark(bookmark) {
    if (iconMovement !== 'random') return;
    const angle = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 1; // Increased speed range: 1 to 2
    return {
      ...bookmark,
      left: Math.random() * (containerWidth - getBookmarkWidth()),
      top: Math.random() * (containerHeight - getBookmarkHeight()),
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      }
    };
  }

  function handleResize() {
    setTimeout(() => {
      containerWidth = window.innerWidth;
      containerHeight = window.innerHeight;
      layoutBookmarks();
      
    }, 0);
  }

  function layoutBookmarks() {
    if (iconMovement != 'none') return;

    const padding = 10;
    const bookmarkWidth = iconSize == 'small' ? 100 : iconSize == 'medium' ? 150 : 200;
    const bookmarkHeight = iconSize == 'small' ? 100 : iconSize == 'medium' ? 150 : 200;
    const columns = Math.floor((containerWidth - padding * 2) / bookmarkWidth);
    const rows = Math.floor((containerHeight - padding * 2) / bookmarkHeight);

    filteredBookmarks = filteredBookmarks?.map((bookmark, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const left = padding + col * bookmarkWidth;
      const top = padding + row * bookmarkHeight;
      return { ...bookmark, left, top, index };
    });
  }

  function animateBookmarks() {
  filteredBookmarks = filteredBookmarks.map(bookmark => {
    let newLeft = bookmark.left + bookmark.velocity.x;
    let newTop = bookmark.top + bookmark.velocity.y;

    if (newLeft <= 0 || newLeft + getBookmarkWidth() >= containerWidth) {
      bookmark.velocity.x *= -1; // Increased bounce force
      newLeft = Math.max(0, Math.min(newLeft, containerWidth - getBookmarkWidth()));
    }
    if (newTop <= 0 || newTop + getBookmarkHeight() >= containerHeight) {
      bookmark.velocity.y *= -1; // Increased bounce force
      newTop = Math.max(0, Math.min(newTop, containerHeight - getBookmarkHeight()));
    }

    let updatedBookmark = { ...bookmark, left: newLeft, top: newTop };

    // Check for collisions with other bookmarks
    filteredBookmarks.forEach(otherBookmark => {
      if (bookmark.id !== otherBookmark.id) {
        const collision = checkCollision(updatedBookmark, otherBookmark);
        if (collision) {
          // Adjust positions to prevent overlap
          const adjustment = getCollisionAdjustment(updatedBookmark, otherBookmark);
          updatedBookmark.left += adjustment.x;
          updatedBookmark.top += adjustment.y;

          // Update velocities for a more powerful bounce effect
          const temp = { 
            x: updatedBookmark.velocity.x * -1, 
            y: updatedBookmark.velocity.y * -1 
          };
          updatedBookmark.velocity.x = otherBookmark.velocity.x * -1;
          updatedBookmark.velocity.y = otherBookmark.velocity.y * -1;
          otherBookmark.velocity.x = temp.x;
          otherBookmark.velocity.y = temp.y;
        }
      }
    });

    return updatedBookmark;
  });

  animationFrameId = requestAnimationFrame(animateBookmarks);
}

function getBookmarkWidth() {
  return iconSize === 'small' ? 120 : iconSize === 'medium' ? 150 : 200;
}

function getBookmarkHeight() {
  return iconSize === 'small' ? 120 : iconSize === 'medium' ? 150 : 200;
}

function checkCollision(bookmark1, bookmark2) {
  const rect1 = getBookmarkRect(bookmark1);
  const rect2 = getBookmarkRect(bookmark2);

  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
}
function getBookmarkRect(bookmark) {
  return {
    left: bookmark.left,
    right: bookmark.left + getBookmarkWidth(),
    top: bookmark.top,
    bottom: bookmark.top + getBookmarkHeight()
  };
}

function getCollisionAdjustment(bookmark1, bookmark2) {
  const rect1 = getBookmarkRect(bookmark1);
  const rect2 = getBookmarkRect(bookmark2);

  const overlapX = Math.min(rect1.right - rect2.left, rect2.right - rect1.left);
  const overlapY = Math.min(rect1.bottom - rect2.top, rect2.bottom - rect1.top);

  if (overlapX < overlapY) {
    return { x: overlapX * (rect1.left < rect2.left ? -1 : 1), y: 0 };
  } else {
    return { x: 0, y: overlapY * (rect1.top < rect2.top ? -1 : 1) };
  }
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
  // layoutBookmarks();
  // bookmarksStore.set(bookmarks);
  
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
  selectedCategory = name;
  const index = name === 'All' ? 0 : categories.findIndex(category => category.name === name) + 1;
  currentCategoryIndex = index;
}


  $: highlightedBookmark = filteredBookmarks.length === 1 ? filteredBookmarks[0] : null;
</script>

<svelte:window on:resize={handleResize} on:keydown={handleKeydown}/>

<div class="relative h-screen p-5 flex flex-col justify-center items-center" tabindex="-1">
  <button
    on:click={toggleDarkMode}
    class="absolute top-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
  >
    {#if $darkMode}
      <Sun size={24} />
    {:else}
      <Moon size={24} />
    {/if}
  </button>

  <button
    on:click={goToManage}
    class="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
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

  <div class="relative w-full h-full" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    {#each filteredBookmarks as bookmark (bookmark.id)}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        class="absolute rounded-lg shadow-lg flex flex-col items-center justify-center p-2 
        transition-all duration-300 hover:scale-110 hover:z-10 
        {highlightedBookmark && highlightedBookmark.id === bookmark.id ? 'ring-4 ring-blue-500' : ''} 
        {dropTarget && dropTarget.id === bookmark.id ? 'border-2 border-blue-500' : ''} 
        dark:shadow-lg dark:shadow-gray-800 
        {iconSize == 'small' ? 'w-20' : iconSize == 'medium' ? 'w-30' : 'w-40'}
        {iconSize == 'small' ? 'h-20' : iconSize == 'medium' ? 'h-30' : 'h-40'}
                 hover:border-2 border-blue-500"
        style="left: {bookmark.left}px; top: {bookmark.top}px;"
        in:fade={{duration: 300}}
        out:scale={{duration: 300}}
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