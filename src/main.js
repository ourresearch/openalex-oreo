import { createApp } from 'vue';
import { createHead } from '@unhead/vue';
import router from './router';
import vuetify from './plugins/vuetify';
import 'vuetify/styles'

import App from './App.vue';

const app = createApp(App);

// Register plugins
app.use(router);
app.use(vuetify);
const head = createHead();
app.use(head);

// Provide config if needed (Vue 3 provides/injects or globalProperties)
app.config.globalProperties.config = {};

// Expose the app to the window for debugging
window.Oreo = app;

app.mount('#app');
