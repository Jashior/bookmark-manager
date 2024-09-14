<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { Cog, Moon, Sun, Search } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { colorThief } from './colorThief.js';
  import { darkMode } from './store.js';

  let bookmarks = [];
  let searchTerm = '';
  let searchInput;
  let highlightedBookmark = null;

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks);
      layoutBookmarks();
    }
    if (searchInput) searchInput.focus();
  });

  function layoutBookmarks() {
    const padding = 20;
    const bookmarkWidth = 120;
    const bookmarkHeight = 120;
    const containerWidth = window.innerWidth - padding * 2;
    const containerHeight = window.innerHeight - padding * 2;

    const columns = Math.floor(containerWidth / bookmarkWidth);
    const rows = Math.floor(containerHeight / bookmarkHeight);

    bookmarks = bookmarks.map((bookmark, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns) % rows;
      const left = padding + col * bookmarkWidth;
      const top = padding + row * bookmarkHeight;
      return { ...bookmark, left, top };
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
    if (event.key === 'Enter' && filteredBookmarks.length === 1) {
      window.open(filteredBookmarks[0].url, '_blank');
    }
  }

  $: filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  $: highlightedBookmark = filteredBookmarks.length === 1 ? filteredBookmarks[0] : null;
</script>

<svelte:window on:resize={layoutBookmarks} on:keydown={handleKeydown}/>

<div class="relative h-screen p-5 flex flex-col justify-center items-center">
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

  <div class="relative mb-8">
    <input
      bind:this={searchInput}
      bind:value={searchTerm}
      placeholder="Search bookmarks..."
      class="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <Search size={20} class="absolute left-3 top-2 text-gray-400" />
  </div>

  <div class="relative w-full h-full">
    {#each filteredBookmarks as bookmark (bookmark.id)}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        class="absolute w-24 h-24 rounded-lg shadow-lg flex flex-col items-center justify-center p-2 transition-all duration-300 hover:scale-110 hover:z-10 {highlightedBookmark && highlightedBookmark.id === bookmark.id ? 'ring-4 ring-blue-500' : ''}"
        style="left: {bookmark.left}px; top: {bookmark.top}px;"
        in:fade={{duration: 300}}
        out:scale={{duration: 300}}
      >
        <img
          src={getFaviconUrl(bookmark.url)}
          alt={bookmark.title}
          class="w-12 h-12 mb-2"
          on:load={(e) => {
            const color = colorThief.getColor(e.target);
            e.target.closest('a').style.backgroundColor = `rgb(${color.join(',')})`;
            e.target.closest('a').style.color = colorThief.getContrastingColor(color);
          }}
        />
        <span class="text-xs text-center overflow-hidden overflow-ellipsis">{bookmark.title}</span>
      </a>
    {/each}
  </div>
</div>