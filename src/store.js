import { writable } from 'svelte/store';

const storedDarkMode = localStorage.getItem('darkMode') === 'true';
export const darkMode = writable(storedDarkMode);

darkMode.subscribe(value => {
  localStorage.setItem('darkMode', value);
  if (value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});