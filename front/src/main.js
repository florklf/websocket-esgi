import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import Toaster from "@meforma/vue-toaster";
import { io } from 'socket.io-client';

const app = createApp(App);

app.use(router);

const socket = io('http://localhost:3000/', { autoConnect: false });
app.provide('socket', socket);

app.use(Toaster).mount('#app');
