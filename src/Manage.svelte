<script>
  import { onMount } from 'svelte';
  import { navigate } from "svelte-routing";
  import { ArrowLeft } from 'lucide-svelte';
  import { Star, Star as StarOutline, GripVertical, Search, EyeOff, EyeIcon, Download, Upload } from 'lucide-svelte';
  import { Pencil, X } from 'lucide-svelte'; // Import the pencil and cross icons
  import WarningModal from './WarningModal.svelte';
  import ConfirmModal from './ConfirmModal.svelte';

  let showWarningModal = false;
  let warningMessage = '';
  let bookmarks = [];
  let categories = [];
  let newBookmark = { title: '', url: '', category: '' };
  let newCategory = { name: '' };
  let editingBookmark = null;
  let editingCategory = null;
  let activeTab = 'bookmarks';
  let iconSize = 'small'; // Default icon size
  let draggedItem = null;
  let draggedOverItem = null;
  let searchTerm = '';
  let searchResults = [];

  onMount(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      bookmarks = JSON.parse(storedBookmarks);
    }
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    }
    const savedSize = localStorage.getItem('iconSize');
    if (savedSize) {
      iconSize = savedSize;
    }
  });

  function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }

  function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  function handleDragStart(event, item, list) {
    draggedItem = { item, list };
    event.dataTransfer.effectAllowed = 'move';
    event.target.style.opacity = '0.5';
  }

  function handleDragOver(event, item) {
    event.preventDefault();
    draggedOverItem = item;
  }

  function handleDragEnd(event) {
    event.target.style.opacity = '1';
    draggedItem = null;
    draggedOverItem = null;
  }

  function handleEnterKey(event, action) {
  if (event.key === 'Enter') {
    event.preventDefault();
    action();
  }
}

  function handleDrop(event, list) {
    event.preventDefault();
    if (!draggedItem || draggedItem.list !== list) return;

    const items = list === 'bookmarks' ? bookmarks : categories;
    const fromIndex = items.findIndex(item => item.id === draggedItem.item.id);
    const toIndex = items.findIndex(item => item.id === draggedOverItem.id);

    if (fromIndex !== toIndex) {
      items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
      if (list === 'bookmarks') {
        bookmarks = [...items];
        saveBookmarks();
      } else {
        categories = [...items];
        saveCategories();
      }
    }
  }

  function addBookmark() {

    function isValidUrl(url) {
        try {
          new URL(url);
          return true;
        } catch (_) {
          return false;
        }
      }

    if (newBookmark.title.length > 20) {
      warningMessage = 'Bookmark title cannot be longer than 20 characters.';
      showWarningModal = true;
      return;
    }
    if (newBookmark.url.length > 50) {
      warningMessage = 'Bookmark URL cannot be longer than 50 characters.';
      showWarningModal = true;
      return;
    }
    if (newBookmark.title && newBookmark.url) {

      if (!newBookmark.url.startsWith('www.') && !newBookmark.url.startsWith('https://') && !newBookmark.url.startsWith('http://')) {
        newBookmark.url = `https://www.${newBookmark.url}`;
      }
      else if (newBookmark.url.startsWith('www.')) {
        newBookmark.url = `https://${newBookmark.url}`;
      }
      if (!isValidUrl(newBookmark.url)) {
        warningMessage = 'URL is not valid';
        showWarningModal = true;
        return;
      }

      bookmarks = [...bookmarks, { ...newBookmark, id: Date.now(), favorite: false, hidden: false }];
      newBookmark = { title: '', url: '', category: '' };
      saveBookmarks();
    } else {
      warningMessage = 'Both title and URL most be set';
      showWarningModal = true;
      return;
    }
  }

  function addCategory() {
    if (newCategory.name.length > 20) {
      warningMessage = 'Category name cannot be longer than 20 characters.';
      showWarningModal = true;
      return;
    }
    if (newCategory.name) {
      categories = [...categories, { ...newCategory, id: Date.now() }];
      newCategory = { name: '' };
      saveCategories();
    }
  }

  function closeWarningModal() {
    showWarningModal = false;
    warningMessage = '';
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

  function toggleHideBookmark(id) {
    bookmarks = bookmarks.map(b =>
      b.id === id ? { ...b, hidden: !b.hidden } : b
    );
    saveBookmarks();
  }

  function deleteCategory(id) {
    const categoryName = categories.find(c => c.id === id).name;
    categories = categories.filter(c => c.id !== id);
    bookmarks = bookmarks.map(b => b.category === categoryName ? { ...b, category: '' } : b);
    saveCategories();
    saveBookmarks();
  }

  let deleteAllBookMarksConfirmModalOpen = false;
  function openBookMarksDeleteModal() {
    deleteAllBookMarksConfirmModalOpen = true;
  }
  function closeBookMarksDeleteModal() {
    deleteAllBookMarksConfirmModalOpen = false;
  }
  function deleteAllBookmarks() {
    openBookMarksDeleteModal();
  }
  function handleBookMarksDeleteOk() {
    // Handle the delete action
    bookmarks = [];
    saveBookmarks();
    closeBookMarksDeleteModal(); // Close the modal after deleting
  }


  let deleteAllCategoriesConfirmModalOpen = false;
  function openCategoriesDeleteModal() {
    deleteAllCategoriesConfirmModalOpen = true;
  }
  function closeCategoriesDeleteModal() {
    deleteAllCategoriesConfirmModalOpen = false;
  }
  function deleteAllCategories() {
    openCategoriesDeleteModal();
  }
  function handleCategoriesDeleteOk() {
    categories = [];
      bookmarks = bookmarks.map(b => ({ ...b, category: '' }));
      saveCategories();
      saveBookmarks();
    closeCategoriesDeleteModal(); // Close the modal after deleting
  }

  function toggleFavorite(id) {
  bookmarks = bookmarks.map(b =>
    b.id === id ? { ...b, favorite: !b.favorite } : b
  );
  saveBookmarks();
}

  // Save Config to local storage
  function saveConfig() {
    localStorage.setItem('iconSize', iconSize);
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

  $: {
    if (activeTab === 'bookmarks') {
      searchResults = searchTerm ? bookmarks.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ) : bookmarks;
    } else if (activeTab === 'categories') {
      searchResults = searchTerm ? categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) : categories;
    }
  }

  function handleTabChange(tab) {
    activeTab = tab;
    searchTerm = '';
    searchResults = [];
  }

  function goToDashboard() {
    navigate("/");
  }
</script>

<div class="h-screen flex flex-col items-center">
  <div class="p-4 flex justify-between items-center">
    <div class="flex items-center">
      <button
      class="px-4 py-2 rounded mr-2 {activeTab === 'bookmarks' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
      on:click={() => handleTabChange('bookmarks')}
    >
      Bookmarks
    </button>
    <button
      class="px-4 py-2 rounded mr-2 {activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
      on:click={() => handleTabChange('categories')}
    >
      Categories
    </button>
    <button
        class="px-4 py-2 rounded mr-2 {activeTab === 'config' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
        on:click={() => handleTabChange('config')}
      >
        Config
    </button>
    </div>
  </div>

  <div class="absolute top-4 right-4 p-2">
    <div class="flex items-center">
      <button
        class="bg-blue-500 text-white px-4 py-2 mr-2 hover:bg-blue-600 transition-colors duration-200  rounded-full"
        on:click={exportData}
        title="Export data"
      >
      <Download  size={24} />
      </button>
      <label 
      class="bg-green-500 rounded-full text-white px-4 py-2 cursor-pointer hover:bg-green-600 transition-colors duration-200 mr-2"
      title="Import data">
        <Upload  size={24} />
        <input
          type="file"
          accept=".json"
          on:change={importData}
          class="hidden"
        />
      </label>
    </div>
  </div>

  <button on:click={goToDashboard}
  class="absolute top-4 left-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
<ArrowLeft size={24} />
</button>

  <div class="flex-1 overflow-hidden">
    <div class="p-4 flex flex-col h-full">
      <div class="mb-4">
        {#if activeTab === 'bookmarks'}
          <div class="mb-4 flex justify-between items-center">
            <div>
              <input
                class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                placeholder="Title"
                bind:value={newBookmark.title}
                on:keypress={(e) => handleEnterKey(e, addBookmark)}
              />
              <input
                class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                placeholder="URL"
                bind:value={newBookmark.url}
                on:keypress={(e) => handleEnterKey(e, addBookmark)}
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
              <input
                type="text"
                placeholder="Search..."
                bind:value={searchTerm}
                class="border p-2 mr-2 ml-10 flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              on:click={deleteAllBookmarks}
            >
              Delete All
            </button>
            </div>
          </div>
        {:else if activeTab === 'categories'}
          <div class="mb-4 flex justify-between items-center">
            <div>
              <input
                class="border p-2 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                placeholder="Category Name"
                bind:value={newCategory.name}
                on:keypress={(e) => handleEnterKey(e, addCategory)}
              />
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                on:click={addCategory}
              >
                Add
              </button>
              <input
              type="text"
              placeholder="Search..."
              bind:value={searchTerm}
              class="border p-2 mr-2 ml-10 flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
              <button
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              on:click={deleteAllCategories}
            >
              Delete All
            </button>
            </div>
          </div>
        {:else if activeTab === 'config'}
          <div class="mb-4 justify-between items-center">
            <h2 class="text-lg font-semibold mr-4">Icon Size</h2>
              {#each ['small', 'medium', 'large'] as size}
              <button
                class="px-4 py-2 m-2 rounded-full transition-colors duration-200
                      {iconSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
                on:click={() => { iconSize = size; saveConfig(); }}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex-1 overflow-y-auto">
        {#if activeTab === 'bookmarks'}
          <div class="mb-4">
            <table class="w-full">
              <thead class="sticky top-0 bg-white dark:bg-gray-800">
                <tr>
                  <th class="text-left">No.</th>
                  <th class="text-left">Favorite</th>
                  <th class="text-left">Title</th>
                  <th class="text-left">URL</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody on:drop|preventDefault={(event) => handleDrop(event, 'bookmarks')}>
                {#each (searchTerm ? searchResults : bookmarks) as bookmark, index (bookmark.id)}
                  <tr
                    class="hover:bg-gray-100 dark:hover:bg-gray-700"
                    draggable={true}
                    on:dragstart={(event) => handleDragStart(event, bookmark, 'bookmarks')}
                    on:dragover={(event) => handleDragOver(event, bookmark)}
                    on:dragend={handleDragEnd}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <button
                        class="text-yellow-500 dark:text-yellow-400"
                        on:click={() => toggleFavorite(bookmark.id)}
                      >
                        <Star size={24} class={bookmark.favorite ? "fill-current" : "stroke-current"} />
                      </button>
                    </td>
                    <td>{bookmark.title}</td>
                    <td><a href={bookmark.url} target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">{bookmark.url}</a></td>
                    <td>{bookmark.category || 'Uncategorized'}</td>
                    <td>
                      <button
                      title={bookmark.hidden ? "Show" : "Hide"}
                      class="{bookmark.hidden ? 'bg-purple-950' : 'bg-purple-500'} text-white px-2 py-1 rounded mr-2 hover:bg-purple-800 transition-colors duration-200"
                      on:click={() => toggleHideBookmark(bookmark.id)}
                    >
                      {#if bookmark.hidden}
                        <EyeOff size={20} />
                      {:else}
                        <EyeIcon size={20} />
                      {/if}
                    </button>
                      <button
                        title="Edit"
                        class="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-200"
                        on:click={() => editBookmark(bookmark)}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        title="Delete"
                        class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                        on:click={() => deleteBookmark(bookmark.id)}
                      >
                        <X size={20} />
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else if activeTab === 'categories'}
          <div class="mb-4">
            <table class="w-full">
              <thead class="sticky top-0 bg-white dark:bg-gray-800">
                <tr>
                  <th class="text-left">No.</th>
                  <th class="text-left">Name</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody on:drop|preventDefault={(event) => handleDrop(event, 'categories')}>
                {#each (searchTerm ? searchResults : categories) as category, index (category.id)}
                  <tr
                    class="hover:bg-gray-100 dark:hover:bg-gray-700"
                    draggable={true}
                    on:dragstart={(event) => handleDragStart(event, category, 'categories')}
                    on:dragover={(event) => handleDragOver(event, category)}
                    on:dragend={handleDragEnd}
                  >
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>
                      <button
                        title="Edit"
                        class="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-200"
                        on:click={() => editCategory(category)}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        title="Delete"
                        class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                        on:click={() => deleteCategory(category.id)}
                      >
                        <X size={20} />
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
    <div class="bg-white dark:bg-gray-800 p-4 rounded w-[800px]"> <!-- Adjusted width here -->
      <h2 class="text-xl font-semibold mb-2">Edit Bookmark</h2>
      <div class="mb-2">
        <input
          class="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingBookmark.title}
          on:keypress={(e) => handleEnterKey(e, updateBookmark)}
          placeholder="Title"
        />
      </div>
      <div class="mb-2">
        <input
          class="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingBookmark.url}
          on:keypress={(e) => handleEnterKey(e, updateBookmark)}
          placeholder="URL"
        />
      </div>
      <div class="mb-4">
        <select
          class="border p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          bind:value={editingBookmark.category}
        >
          <option value="">No Category</option>
          {#each categories as category}
            <option value={category.name}>{category.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex justify-end space-x-2">
        <button
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
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
  </div>
  {/if}

  {#if editingCategory}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-4 rounded">
        <h2 class="text-xl font-semibold mb-2">Edit Category</h2>
        <input
          class="border p-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          type="text"
          bind:value={editingCategory.name}
          on:keypress={(e) => handleEnterKey(e, updateCategory)}
        />
        <div class="flex justify-end space-x-2">
          <button
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
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
    </div>
  {/if}

  {#if showWarningModal}
    <WarningModal isOpen={showWarningModal} onClose={closeWarningModal} message={warningMessage}
    />
  {/if}

  <ConfirmModal
    isOpen={deleteAllBookMarksConfirmModalOpen}
    onClose={closeBookMarksDeleteModal}
    onOk={handleBookMarksDeleteOk}
    message="Are you sure you want to delete all bookmarks?"
  />

  <ConfirmModal
  isOpen={deleteAllCategoriesConfirmModalOpen}
  onClose={closeCategoriesDeleteModal}
  onOk={handleCategoriesDeleteOk}
  message="Are you sure you want to delete all categories?"
/>
</div>
