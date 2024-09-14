<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { Cog, Moon, Sun } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { colorThief } from './colorThief.js';
  import { darkMode } from './store.js';

  let bookmarks = [];

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks);
      shuffleBookmarks();
    }
  });

  function shuffleBookmarks() {
    for (let i = bookmarks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bookmarks[i], bookmarks[j]] = [bookmarks[j], bookmarks[i]];
    }
    bookmarks = bookmarks; // trigger reactivity
  }

  function getRandomPosition() {
    const x = Math.floor(Math.random() * 80); // % from left
    const y = Math.floor(Math.random() * 80); // % from top
    return `left: ${x}%; top: ${y}%;`;
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
</script>

<div class="relative h-screen">
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

  {#each bookmarks as bookmark (bookmark.id)}
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      class="absolute w-24 h-24 rounded-lg shadow-lg flex flex-col items-center justify-center p-2 transition-all duration-300 hover:scale-110 hover:z-10"
      style={getRandomPosition()}
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