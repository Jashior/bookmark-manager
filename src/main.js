import App from './App.svelte'
import './app.css'

const app = new App({
  target: document.body,
  props: {
    url: '',
  }
})

export default app