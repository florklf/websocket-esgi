<script setup>
import {
  ref, inject, onMounted, computed, onBeforeMount, onBeforeUnmount, onServerPrefetch,
} from 'vue';

const props = defineProps({
  conversationId: Number,
});
const input = ref();

const socket = inject('socket');
const currentUser = inject('currentUser');
const conversation = ref();

function sendMessage(e) {
  if ((e.key === 'Enter' || e.keyCode === 13)) {
    const content = input.value;
    socket.emit('private message', {
      content,
      conversation_id: props.conversationId,
    });
    input.value = '';
  }
}

onMounted(() => {
  socket.emit('join conversation', props.conversationId);
});

onBeforeUnmount(() => {
  socket.emit('leave conversation', props.conversationId);
});

socket.on('private message', ({ content, from }) => {
  console.log('received private message', { content, from });
  conversation.value.messages.push({
    content,
    user_id: from,
  });
});

const getConversation = async () => {
  const res = await fetch(`http://localhost:3000/api/conversations/${props.conversationId}`, { credentials: 'include' });
  return res.json();
};

onBeforeMount(async () => {
  console.log(props.conversationId);
  conversation.value = await getConversation();
});

const participants = computed(() => {
  if (conversation.value) {
    return conversation.value.users.filter((participant) => participant.id !== currentUser.value.id);
  }
  return [];
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
            <template v-for="(user, index) in participants" :key="user.id">
              <template v-if="index > 0">
                ,
              </template>
              <span>{{ user.username }}</span>
            </template>
          </h1>
          <p class="text-sm font-medium text-gray-500">
            Applied for <a href="#" class="text-gray-900">Front End Developer</a> on <time datetime="2020-08-25">August
              25, 2020</time>
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

    <div v-if="conversation" class="flex flex-col h-screen">
      <div v-for="m in conversation.messages" :key="m.id" class="mx-auto max-w-7xl sm:px-6 lg:px-8 w-full">
        <div :class="{ 'bg-green-400 ml-auto': m.user_id == currentUser.id, 'bg-gray-200 mr-auto': m.user_id !== currentUser.id }" class="w-fit rounded-3xl p-3">
          {{ m.content }}
        </div>
      </div>
      <!-- Input -->
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 w-full py-4 mt-auto">
        <input
          v-model="input"
          type="text"
          class="bg-gray-200 block w-full rounded-md py-4 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Write a message..."
          @keypress="sendMessage"
        />
      </div>
    </div>
  </div>
</template>
