import { createApp } from 'vue';
import Toaster from '@meforma/vue-toaster';
import { io } from 'socket.io-client';
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

app.use(router);

const socket = io(import.meta.env.VITE_BASE_API_URL, { autoConnect: false });
app.provide('socket', socket);

app.use(Toaster).mount('#app');
