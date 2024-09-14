<!-- Modal.svelte -->
<script>
    export let isOpen = false;
    export let onClose = () => {};
    export let message = '';
  
    function close() {
      onClose();
    }
  </script>
  
  {#if isOpen}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-2">Warning</h2>
        <p class="mb-4">{message}</p>
        <div class="flex justify-end">
          <button
            class="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition-colors duration-200"
            on:click={close}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
  