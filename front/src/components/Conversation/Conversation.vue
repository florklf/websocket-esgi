<script setup>
import { ref, inject, onMounted } from 'vue';
import ConversationMessage from './ConversationMessage.vue';

const socket = inject('socket');
console.log(socket);

const props = defineProps({
  selectedUser: Object,
});
const message = ref();

// console.log(user);
// function sendMessage(e) {
//   if (e.key === 'Enter' || e.keyCode === 13) {
//     console.log(e.target.value);
//     socket.emit('chat message', e.target.value);
//   }
// }
function sendMessage(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    if (props.selectedUser) {
      socket.emit('private message', {
        message,
        to: props.selectedUser.userID,
      });
      console.log({ message, to: props.selectedUser.userID });
    //   props.selectedUser.messages.push({
    //     content,
    //     fromSelf: true,
    //   });
    }
  }
}
socket.on('private message', ({ content, from }) => {
  console.log(content);
  console.log(from);
  // for (let i = 0; i < this.users.length; i++) {
  //   const user = this.users[i];
  //   if (user.userID === from) {
  //     user.messages.push({
  //       content,
  //       fromSelf: false,
  //     });
  //     if (user !== this.selectedUser) {
  //       user.hasNewMessages = true;
  //     }
  //     break;
  //   }
  // }
});

onMounted(() => {
});
</script>

<template>
  <div class="flex-1 flex flex-col pl-12 pr-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between md:space-x-5 border-b-2 pb-2 mb-2">
      <div class="flex items-start space-x-5">
        <div class="flex-shrink-0">
          <div class="relative">
            <img class="h-16 w-16 rounded-full" src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80" alt="" />
            <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
          </div>
        </div>
        <div class="pt-1.5">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ selectedUser.username }}
          </h1>
          <p class="text-sm font-medium text-gray-500">
            Applied for <a href="#" class="text-gray-900">Front End Developer</a> on <time datetime="2020-08-25">August 25, 2020</time>
          </p>
        </div>
      </div>
      <!-- <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
        <button type="button" class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          Disqualify
        </button>
        <button type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          Advance to offer
        </button>
      </div> -->
    </div>

    <div class="flex flex-col h-screen">
      <!-- <ConversationsListItem v-for="user in users" :key="user.id" :username="user.username" @click="$emit('select-conversation', user)" /> -->
      <!-- Discussion -->
      <!-- <ConversationMessage v-for="message in messages" :key="message.id" :message="message" /> -->
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 w-full flex-1">
        <div class="w-fit ml-auto rounded-3xl bg-green-400 p-3">
          premier message
        </div>
        <div class="w-fit mr-auto rounded-3xl bg-gray-200 p-3">
          2e message
        </div>
        <div class="w-fit mr-auto rounded-3xl bg-gray-200 p-3">
          3e super message
        </div>
        <div class="w-fit ml-auto rounded-3xl bg-green-400 p-3">
          un 4e super message
        </div>
      </div>

      <!-- Input -->
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 w-full mb-2">
        <input v-model="message" type="text" class="bg-gray-200 block w-full rounded-md py-4 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Write a message..." @keypress="sendMessage" />
      </div>
    </div>
  </div>
</template>