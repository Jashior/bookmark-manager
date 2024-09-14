<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { ArrowLeft } from 'lucide-svelte';
  import { darkMode } from './store.js';

  let bookmarks = [];
  let newBookmark = { title: '', url: '' };
  let editingBookmark = null;

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks);
    }
  });

  function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  function addBookmark() {
    if (newBookmark.title && newBookmark.url) {
      bookmarks = [...bookmarks, { ...newBookmark, id: Date.now() }];
      newBookmark = { title: '', url: '' };
      saveBookmarks();
    }
  }

  function editBookmark(bookmark) {
    editingBookmark = { ...bookmark };
  }

  function updateBookmark() {
    bookmarks = bookmarks.map(b => b.id === editingBookmark.id ? editingBookmark : b);
    editingBookmark = null;
    saveBookmarks();
  }

  function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
  }

  function exportBookmarks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookmarks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function importBookmarks(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBookmarks = JSON.parse(e.target.result);
          bookmarks = importedBookmarks;
          saveBookmarks();
        } catch (error) {
          alert('Error importing bookmarks. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  function goToDashboard() {
    navigate("/");
  }
</script>

<div class="p-4">
  <button
    on:click={goToDashboard}
    class="mb-4 flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
  >
    <ArrowLeft size={24} class="mr-2" />
    Back to Dashboard
  </button>

  <h1 class="text-3xl font-bold mb-4">Manage Bookmarks</h1>

  <div class="mb-4">
    <h2 class="text-xl font-semibold mb-2">Add Bookmark</h2>
    <input
      class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      type="text"
      placeholder="Title"
      bind:value={newBookmark.title}
    />
    <input
      class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      type="text"
      placeholder="URL"
      bind:value={newBookmark.url}
    />
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
      on:click={addBookmark}
    >
      Add
    </button>
  </div>

  <div class="mb-4">
    <h2 class="text-xl font-semibold mb-2">Bookmarks</h2>
    <table class="w-full">
      <thead>
        <tr>
          <th class="text-left">Title</th>
          <th class="text-left">URL</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each bookmarks as bookmark (bookmark.id)}
          <tr>
            <td>{bookmark.title}</td>
            <td><a href={bookmark.url} target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">{bookmark.url}</a></td>
            <td>
              <button
                class="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-200"
                on:click={() => editBookmark(bookmark)}
              >
                Edit
              </button>
              <button
                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                on:click={() => deleteBookmark(bookmark.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if editingBookmark}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">Edit Bookmark</h2>
        <input
          class="border p-2 mr-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingBookmark.title}
        />
        <input
          class="border p-2 mr-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingBookmark.url}
        />
        <button
          class="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition-colors duration-200"
          on:click={updateBookmark}
        >
          Save
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
          on:click={() => editingBookmark = null}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  <div class="mt-4">
    <button
      class="bg-purple-500 text-white px-4 py-2 rounded mr-2 hover:bg-purple-600 transition-colors duration-200"
      on:click={exportBookmarks}
    >
      Export Bookmarks
    </button>
    <label class="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition-colors duration-200">
      Import Bookmarks
      <input
        type="file"
        accept=".json"
        on:change={importBookmarks}
        class="hidden"
      />
    </label>
  </div>
</div>