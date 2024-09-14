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

export const bookmarks = writable(JSON.parse(localStorage.getItem('bookmarks') || '[]'));
export const categories = writable(JSON.parse(localStorage.getItem('categories') || '[]'));

bookmarks.subscribe(value => {
  localStorage.setItem('bookmarks', JSON.stringify(value));
});

categories.subscribe(value => {
  localStorage.setItem('categories', JSON.stringify(value));
});