<script setup>
import { createDOMCompilerError } from '@vue/compiler-dom';
import { io } from 'socket.io-client';
import {
  onBeforeMount, ref, provide, computed, inject,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { createToaster } from '@meforma/vue-toaster';
import Conversation from '../components/Conversation/Conversation.vue';
import ConversationsList from '../components/ConversationsList/ConversationsList.vue';

const router = useRouter();

const currentUser = ref();
const connectedUsers = ref();
const allUsers = ref();
const conversations = ref();
const requests = ref();
const selectedConv = ref();
const newConvUser = ref();
const componentKey = ref(0);
const groupConversations = ref();

const toaster = createToaster({
  position: 'bottom-right',
  duration: 3000,
});

const socket = inject('socket');
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
socket.on('notification', ({
  type, content, from, to,
}) => {
  if (type === 'private') {
    toaster.show(`${from.username} vous a envoyé un message: ${content.length > 10 ? `${content.slice(0, 10)}...` : content}`, {
      type: 'info',
      onClick: () => {
        newConversation(from);
      },
    });
  } else {
    toaster.show(`${from.username} a envoyé un message dans le groupe ${to ? `"${to}"` : ''}`, {
      type: 'info',
    });
  }
});
socket.on('ask adviser', ({ pendingRequest }) => {
  toaster.show(`${pendingRequest.user.username} vous a demandé de l'aide`, {
    type: 'info',
  });
  requests.value.push(pendingRequest);
});
socket.on('accept request', ({ from_user }) => {
  toaster.show(`${from_user.username} a accepté votre demande d'aide`, {
    type: 'info',
    onClick: () => {
      newConversation(from_user);
    },
  });
});
socket.on('reject request', ({ from_username }) => {
  toaster.show(`${from_username} a refusé votre demande d'aide`, {
    type: 'info',
  });
});
socket.on('toggle user status', ({ status }) => {
  currentUser.value.status = status;
});
socket.on('no adviser', () => {
  toaster.show('Il n\'y a pas de conseiller disponible pour le moment', { type: 'error' });
});
socket.on('commercial notification', (message) => {
  toaster.show(message, { type: 'info' });
});
socket.on('user joined', async () => {
  groupConversations.value = await getConversationsBy({ type: 'group' });
});

const selectedConversation = (data) => {
  if (data.max_users - data.users.length === 0) {
    toaster.show('Vous ne pouvez pas rejoindre cette conversation, elle est pleine', { type: 'error' });
    return;
  }
  socket.emit('join conversation', data.id);
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
const getConversationsBy = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`http://localhost:3000/api/conversations?${whereClause}`, { credentials: 'include' });
  return res.json();
};

const getPendingRequests = async () => {
  const res = await fetch('http://localhost:3000/api/requests', { credentials: 'include' });
  return res.json();
};

const askAdviser = () => {
  if (currentUser.value.role === 'admin') {
    toaster.show('Vous ne pouvez pas demander à parler avec un conseiller', { type: 'error' });
    return;
  }
  socket.emit('ask adviser', currentUser.value.id);
};

const acceptRequest = async (request_id) => {
  socket.emit('accept request', request_id);
  newConversation(requests.value.find((req) => req.id === request_id).user);
  requests.value = requests.value.filter((req) => req.id !== request_id);
};
const refuseRequest = (request_id) => {
  socket.emit('reject request', request_id);
  requests.value = requests.value.filter((req) => req.id !== request_id);
};

const toggleUserStatus = (user) => {
  socket.emit('toggle user status', user);
};

const newConversation = (user) => {
  const found = conversations.value.some((conv) => {
    let result = false;
    if (conv.type === 'private') {
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

const updateConversation = async (conv) => {
  const existingPrivateConversation = conversations.value.findIndex((c) => c.id === conv.id);
  if (existingPrivateConversation !== -1) {
    conversations.value.splice(existingPrivateConversation, 1, conv);
  }
  groupConversations.value = await getConversationsBy({ type: 'group' });
};

onBeforeMount(async () => {
  try {
    currentUser.value = await fetchCurrentUser();
    allUsers.value = await fetchUsers();
    conversations.value = await getConversations();
    requests.value = await getPendingRequests();
    groupConversations.value = await getConversationsBy({ type: 'group' });
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
    <ConversationsList
      :conversations="conversations"
      @select-conversation="selectedConversation"
      @start-conversation="startConversation"
    />
    <div v-if="!selectedConv && !newConvUser" class="flex-1 flex flex-col pl-12 pr-6 overflow-y-auto">
      <div class="flex justify-between mb-10">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Bienvenue {{ currentUser.username }}
          </h1>
          <p class="text-gray-500">
            Sélectionnez un utilisateur pour débuter une conversation
          </p>
        </div>
        <div class="flex items-center">
          <button
            class="relative focus:outline-none text-sm text-white font-semibold h-12 px-6 rounded-lg"
            :class="currentUser.status === 'active' ? 'bg-green-700 hover:bg-green-900' : 'bg-gray-700 hover:bg-gray-900'"
            @click="toggleUserStatus(currentUser)"
          >
            {{ currentUser.status === 'active' ? 'En ligne' : 'Hors ligne' }}
          </button>
          <button
            class="m-3 bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto"
            @click="askAdviser"
          >
            Parler à un conseiller
          </button>
          <button
            class="relative bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 text-sm text-white font-semibold h-12 px-6 rounded-lg"
            @click="logout"
          >
            Déconnexion
          </button>
        </div>
      </div>
      <ul role="list" class="my-3 divide-y divide-gray-200">
        <h2 class="text-xl font-medium text-gray-500 mb-4">
          Démarrer une conversation privée
        </h2>
        <li
          v-for="user in allUsers"
          :key="user.id"
          class="flex p-4 hover:bg-gray-200 cursor-pointer"
          @click="newConversation(user)"
        >
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
            <p class="text-sm text-gray-600">
              Utilisateurs connectés: {{ group.users?.length }} ({{ group.max_users - group.users?.length }} places disponibles)
            </p>
          </div>
        </li>
      </ul>
    </div>
    <Conversation v-else-if="selectedConv" :key="componentKey" :conversation-id="selectedConv.id" @new-conversation="addConversationToList" @updated-conversation="updateConversation" />
    <Conversation v-else-if="newConvUser" :new-conv-user="newConvUser" @new-conversation="(conv) => conversations.push(conv)" />
    <template v-if="requests && currentUser.role === 'admin'">
      <div class="overflow-y-auto">
        <h1 class="text-2xl font-bold text-gray-900 m-3">
          Demande en cours
        </h1>
        <ul v-if="requests.length > 0" role="list" class="divide-y divide-gray-200">
          <li v-for="request in requests" :key="request.id" class="flex p-4 hover:bg-gray-200 justify-between">
            <div class="flex items-center">
              <img class="h-10 w-10 rounded-full mr-2" src="https://picsum.photos/200/" alt="" />
              <p class="text-sm font-medium text-gray-900">
                {{ request.user.username }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <span
                class="p-1 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer"
                @click="acceptRequest(request.id)"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span class="p-1 rounded-full bg-slate-200 hover:bg-slate-300 cursor-pointer" @click="refuseRequest(request.id)">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </div>
          </li>
        </ul>
        <div v-else class="text-center text-gray-500 m-3">
          Aucune demande en cours
        </div>
      </div>
    </template>
  </div>
</template>
