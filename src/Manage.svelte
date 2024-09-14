<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { ArrowLeft } from 'lucide-svelte';
  import { darkMode } from './store.js';
  import { Star, Star as StarOutline } from 'lucide-svelte';

  let bookmarks = [];
  let categories = [];
  let newBookmark = { title: '', url: '', category: '' };
  let newCategory = { name: '' };
  let editingBookmark = null;
  let editingCategory = null;
  let activeTab = 'bookmarks';

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    const storedCategories = localStorage.getItem('categories');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks);
    }
    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    }
  });

  function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  function addBookmark() {
    if (newBookmark.title && newBookmark.url) {
      bookmarks = [...bookmarks, { ...newBookmark, id: Date.now(), favorite: false }];
      newBookmark = { title: '', url: '', category: '' };
      saveBookmarks();
    }
  }

  function addCategory() {
    if (newCategory.name) {
      categories = [...categories, { ...newCategory, id: Date.now() }];
      newCategory = { name: '' };
      saveCategories();
    }
  }

  function editBookmark(bookmark) {
    editingBookmark = { ...bookmark };
  }

  function editCategory(category) {
    editingCategory = { ...category };
  }

  function updateBookmark() {
    bookmarks = bookmarks.map(b => b.id === editingBookmark.id ? editingBookmark : b);
    editingBookmark = null;
    saveBookmarks();
  }

  function updateCategory() {
    const oldName = categories.find(c => c.id === editingCategory.id).name;
    categories = categories.map(c => c.id === editingCategory.id ? editingCategory : c);
    bookmarks = bookmarks.map(b => b.category === oldName ? { ...b, category: editingCategory.name } : b);
    editingCategory = null;
    saveCategories();
    saveBookmarks();
  }

  function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
  }

  function deleteCategory(id) {
    const categoryName = categories.find(c => c.id === id).name;
    categories = categories.filter(c => c.id !== id);
    bookmarks = bookmarks.map(b => b.category === categoryName ? { ...b, category: '' } : b);
    saveCategories();
    saveBookmarks();
  }

  function deleteAllBookmarks() {
    if (confirm('Are you sure you want to delete all bookmarks?')) {
      bookmarks = [];
      saveBookmarks();
    }
  }

  function deleteAllCategories() {
    if (confirm('Are you sure you want to delete all categories? This will also remove category assignments from all bookmarks.')) {
      categories = [];
      bookmarks = bookmarks.map(b => ({ ...b, category: '' }));
      saveCategories();
      saveBookmarks();
    }
  }

  function toggleFavorite(id) {
  bookmarks = bookmarks.map(b =>
    b.id === id ? { ...b, favorite: !b.favorite } : b
  );
  saveBookmarks();
}


  function exportData() {
    const data = {
      bookmarks,
      categories
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bookmarks_and_categories.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function importData(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          bookmarks = importedData.bookmarks || [];
          categories = importedData.categories || [];
          saveBookmarks();
          saveCategories();
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  function goToDashboard() {
    navigate("/");
  }
</script>

<div class="h-screen flex flex-col">
  <div class="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
    <div class="flex items-center">
      <button
      class="px-4 py-2 rounded mr-2 {activeTab === 'bookmarks' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
      on:click={() => activeTab = 'bookmarks'}
    >
      Bookmarks
    </button>
    <button
      class="px-4 py-2 rounded mr-2 {activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
      on:click={() => activeTab = 'categories'}
    >
      Categories
    </button>
    </div>
    <h1 class="text-3xl font-bold">Bookmarks Manager</h1>

    <div class="flex items-center">
      <button
        class="bg-purple-500 text-white px-4 py-2 rounded mr-2 hover:bg-purple-600 transition-colors duration-200"
        on:click={exportData}
      >
        Export
      </button>
      <label class="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition-colors duration-200 mr-2">
        Import
        <input
          type="file"
          accept=".json"
          on:change={importData}
          class="hidden"
        />
      </label>
      <button
        on:click={goToDashboard}
        class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-hidden">
    <div class="p-4 flex flex-col h-full">
      <div class="mb-4">
        {#if activeTab === 'bookmarks'}
          <div class="mb-4 flex justify-between items-center">
            <div>
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
              <select
                class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                bind:value={newBookmark.category}
              >
                <option value="">No Category</option>
                {#each categories as category}
                  <option value={category.name}>{category.name}</option>
                {/each}
              </select>
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                on:click={addBookmark}
              >
                Add
              </button>
              <button
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              on:click={deleteAllBookmarks}
            >
              Delete All Bookmarks
            </button>
            </div>
          </div>
        {:else}
          <div class="mb-4 flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold mb-2">Add Category</h2>
              <input
                class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                placeholder="Category Name"
                bind:value={newCategory.name}
              />
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                on:click={addCategory}
              >
                Add
              </button>
              <button
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              on:click={deleteAllCategories}
            >
              Delete All Categories
            </button>
            </div>
          </div>
        {/if}
      </div>

      <div class="flex-1 overflow-y-auto">
        {#if activeTab === 'bookmarks'}
          <div class="mb-4">
            <h2 class="text-xl font-semibold mb-2">Bookmarks</h2>
            <table class="w-full">
              <thead>
                <tr>
                  <th class="text-left">No.</th>
                  <th class="text-left">Favorite</th>
                  <th class="text-left">Title</th>
                  <th class="text-left">URL</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each bookmarks as bookmark, index (bookmark.id)}
                  <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td>{index + 1}</td>
                    <td>
                      <button
                        class="text-yellow-500 dark:text-yellow-400"
                        on:click={() => toggleFavorite(bookmark.id)}
                      >
                        {#if bookmark.favorite}
                          <Star size={24} class="fill-current" />
                        {:else}
                          <Star size={24} class="stroke-current" />
                        {/if}
                      </button>
                    </td>
                    <td>{bookmark.title}</td>
                    <td><a href={bookmark.url} target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">{bookmark.url}</a></td>
                    <td>{bookmark.category || 'Uncategorized'}</td>
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
        {:else}
          <div class="mb-4">
            <h2 class="text-xl font-semibold mb-2">Categories</h2>
            <table class="w-full">
              <thead>
                <tr>
                  <th class="text-left">No.</th>
                  <th class="text-left">Name</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each categories as category, index (category.id)}
                  <tr class="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>
                      <button
                        class="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-200"
                        on:click={() => editCategory(category)}
                      >
                        Edit
                      </button>
                      <button
                        class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                        on:click={() => deleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
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
        <select
          class="border p-2 mr-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          bind:value={editingBookmark.category}
        >
          <option value="">No Category</option>
          {#each categories as category}
            <option value={category.name}>{category.name}</option>
          {/each}
        </select>
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

  {#if editingCategory}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">Edit Category</h2>
        <input
          class="border p-2 mr-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingCategory.name}
        />
        <button
          class="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition-colors duration-200"
          on:click={updateCategory}
        >
          Save
        </button>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
          on:click={() => editingCategory = null}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>
