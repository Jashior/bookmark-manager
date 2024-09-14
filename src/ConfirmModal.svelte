<script>
    export let isOpen = false;
    export let onClose = () => {};
    export let onOk = () => {};
    export let message = '';
  
    function close() {
      onClose();
    }
  
    function handleOk() {
      onOk();
      close(); // Optionally close the modal after OK is clicked
    }

    function handleKeydown(event) {
    if (event.key === 'Enter' && isOpen) {
      close();
    }
  }

  $: {
  if (isOpen) {
    window.addEventListener('keydown', handleKeydown);
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
}
  </script>
  
  {#if isOpen}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-2">Warning</h2>
        <p class="mb-4">{message}</p>
        <div class="flex justify-end space-x-2">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
            on:click={handleOk}        
          >
            OK
          </button>
          <button
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
          on:click={close}
        >
          Close
        </button>
        </div>
      </div>
    </div>
  {/if}
  