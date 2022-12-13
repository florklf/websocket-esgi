<script setup>
import { createDOMCompilerError } from '@vue/compiler-dom';
import { io } from 'socket.io-client';
import { onBeforeMount, ref, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createToaster } from '@meforma/vue-toaster';
import Conversation from '../components/Conversation/Conversation.vue';
import ConversationsList from '../components/ConversationsList/ConversationsList.vue';

const router = useRouter();

const currentUser = ref();
const connectedUsers = ref();
const allUsers = ref();
const conversations = ref();
const selectedConv = ref();
const newConvUser = ref();
const componentKey = ref(0);
const groupConversations = ref();

const toaster = createToaster({
  position: 'bottom-right',
  duration: 3000,
});

const socket = io('http://localhost:3000/', { autoConnect: false });
provide('socket', socket);
provide('currentUser', currentUser);

socket.on('users', (users) => {
  connectedUsers.value = users.filter((item) => item.userID !== currentUser.value.id).sort((a, b) => {
    if (a.username < b.username) return -1;
    return a.username > b.username ? 1 : 0;
  });
});
socket.on('user connected', (arrivingUser) => {
  connectedUsers.value.push(arrivingUser);
});
socket.on('user disconnected', (leavingUser) => {
  connectedUsers.value = connectedUsers.value.filter((user) => user.userID !== leavingUser.userID);
});
socket.on('notification', ({ content, from_username, from_id }) => {
  toaster.show(`${from_username} vous a envoyé un message: ${content.length > 10 ? `${content.slice(0, 10)}...` : content}`, {
    type: 'info',
    onClick: () => {
      newConversation(from_id);
    },
  });
});

const selectedConversation = (data) => {
  console.log(data);
  selectedConv.value = data;
  componentKey.value += 1;
};
const startConversation = () => {
  selectedConv.value = null;
  newConvUser.value = null;
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
  const res = await fetch(`http://localhost:3000/api/conversations/user/${currentUser.value.id}`, { credentials: 'include' });
  return res.json();
};
const getGroupConversations = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`http://localhost:3000/api/conversations?${whereClause}`, { credentials: 'include' });
  return res.json();
};

const newConversation = (user) => {
  const found = conversations.value.some((conv) => {
    let result = false;
    if (conv.users.length === 2) {
      if (conv.users.some((u) => u.id === user.id && conv.users.some((e) => e.id === currentUser.value.id))) {
        selectedConv.value = conv;
        result = true;
      }
    }
    return result;
  });
  if (!found) {
    newConvUser.value = user;
  }
};

const addConversationToList = (conv) => {
  if (conversations.value.some((c) => c.id === conv.id)) return;
  conversations.value.push(conv);
};

onBeforeMount(async () => {
  try {
    currentUser.value = await fetchCurrentUser();
    allUsers.value = await fetchUsers();
    conversations.value = await getConversations();
    groupConversations.value = await getGroupConversations({ type: 'group' });
    allUsers.value = allUsers.value.filter((item) => item.id !== currentUser.value.id).sort((a, b) => {
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
    socket.auth = currentUser.value;
    socket.connect();
  } catch (err) {
    console.log(err);
  }
});
</script>

<template>
  <div v-if="currentUser" class="flex h-screen py-6 divide-x">
    <ConversationsList :conversations="conversations" @select-conversation="selectedConversation" @start-conversation="startConversation" />
    <div v-if="!selectedConv && !newConvUser" class="flex-1 flex flex-col pl-12 pr-6">
      <div class="flex justify-between mb-10">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Bienvenue {{ currentUser.username }}
          </h1>
          <p class="text-gray-500">
            Sélectionnez un utilisateur pour débuter une conversation
          </p>
        </div>
        <!-- logout button -->
        <button
          class="relative bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 text-sm text-white font-semibold h-12 px-6 rounded-lg"
          @click="logout"
        >
          Déconnexion
        </button>
      </div>
      <ul role="list" class="my-3 divide-y divide-gray-200">
        <h2 class="text-xl font-medium text-gray-500 mb-4">
          Démarrer une conversation privée
        </h2>
        <li v-for="user in allUsers" :key="user.id" class="flex p-4 hover:bg-gray-200 cursor-pointer" @click="newConversation(user)">
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
      <ul role="list" class="my-3 divide-y divide-gray-200">
        <h2 class="text-xl font-medium text-gray-500 mb-4">
          Rejoindre une conversation de groupe
        </h2>
        <li v-for="group in groupConversations" :key="group.id" class="flex p-4 hover:bg-gray-200 cursor-pointer" @click="selectedConversation(group)">
          <img class="h-10 w-10 rounded-full" src="https://picsum.photos/200/" alt="" />
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">
              {{ group.name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ group.id }}
            </p>
          </div>
        </li>
      </ul>
    </div>
    <Conversation v-else-if="selectedConv" :key="componentKey" :conversation-id="selectedConv.id" @new-conversation="addConversationToList" />
    <Conversation v-else-if="newConvUser" :new-conv-user="newConvUser" @new-conversation="(conv) => conversations.push(conv)" />
  </div>
</template>
