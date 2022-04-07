import App from './App.svelte';
import story from './data/story.json'

const content = story.article;
const meta = story.meta;

const app = new App({
  target: document.body,
  props: {
    content: content,
    meta: meta
  }
});

export default app;