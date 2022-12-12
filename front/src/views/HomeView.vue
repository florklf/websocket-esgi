<script setup>
import { createDOMCompilerError } from '@vue/compiler-dom';
import { io } from 'socket.io-client';
import { onBeforeMount, ref, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Conversation from '../components/Conversation/Conversation.vue';
import ConversationsList from '../components/ConversationsList/ConversationsList.vue';

const selectedUser = ref();
const currentUser = ref();
const connectedUsers = ref();
const allUsers = ref();
const conversations = ref();
const router = useRouter();

const socket = io('http://localhost:3000/', { autoConnect: false });
provide('socket', socket);

socket.on('chat message', (msg) => {
  console.log(msg);
});
socket.on('users', (users) => {
  connectedUsers.value = users.filter((item) => item.userID !== currentUser.value.id).sort((a, b) => {
    if (a.username < b.username) return -1;
    return a.username > b.username ? 1 : 0;
  });
});
socket.on('user connected', (arrivingUser) => {
  connectedUsers.value.push(arrivingUser);
});

const selectedConversation = (data) => {
  selectedUser.value = data;
};
const startConversation = () => {
  selectedUser.value = null;
};

const fetchCurrentUser = async () => {
  const res = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
  return res.json();
};
const fetchUsers = async () => {
  const res = await fetch('http://localhost:3000/api/users');
  return res.json();
};

const logout = async () => {
  socket.disconnect();
  const res = await fetch('http://localhost:3000/api/logout', { credentials: 'include' });
  if (res.status === 200) {
    router.push({ name: 'Login' });
  }
};
const getConversations = async () => {
  const res = await fetch(`http://localhost:3000/api/conversations/${currentUser.value.id}`, { credentials: 'include' });
  return res.json();
};

onBeforeMount(async () => {
  try {
    currentUser.value = await fetchCurrentUser();
    allUsers.value = await fetchUsers();
    conversations.value = await getConversations();
    console.log(conversations.value);
    allUsers.value = allUsers.value.filter((item) => item.id !== currentUser.value.id).sort((a, b) => {
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
    socket.auth = currentUser.value;
    socket.connect();
    console.log(socket);
  } catch (err) {
    console.log(err);
  }
});
</script>

<template>
  <div class="flex h-screen py-6 divide-x">
    <ConversationsList :users="connectedUsers" @select-conversation="selectedConversation" @start-conversation="startConversation" />
    <div v-if="!selectedUser && currentUser" class="flex-1 flex flex-col pl-12 pr-6">
      <div class="flex justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Bienvenue {{ currentUser.username }}
          </h1>
          <p class="text-gray-500">
            Sélectionnez un utilisateur pour débuter une conversation
          </p>
        </div>
        <!-- logout button -->
        <button class="bg-gray-200 hover:bg-gray-300 rounded-full p-2" @click="logout">
          Déconnexion
        </button>
      </div>
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="user in allUsers" :key="user.id" class="flex py-4 hover:bg-gray-200" @click="selectedUser = user">
          <img class="h-10 w-10 rounded-full" src="https://picsum.photos/200/" alt="" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">
              {{ user.username }}
            </p>
            <p class="text-sm text-gray-500">
              {{ user.id }}
            </p>
          </div>
        </li>
      </ul>
    </div>
    <Conversation v-else-if="selectedUser" :selected-user="selectedUser" />
  </div>
</template>