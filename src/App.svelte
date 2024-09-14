<script>
  import { Router, Route } from "svelte-routing";
  import { darkMode } from './store.js';
  import Dashboard from "./Dashboard.svelte";
  import Manage from "./Manage.svelte";
  import { onMount } from 'svelte';

  export let url = "";

  onMount(() => {
    // Ensure the class is applied on initial load
    if ($darkMode) {
      document.documentElement.classList.add('dark');
    }
  });
</script>

<Router {url}>
  <main class:dark={$darkMode}>
    <div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <Route path="/" component={Dashboard} />
      <Route path="/manage" component={Manage} />
    </div>
  </main>
</Router>