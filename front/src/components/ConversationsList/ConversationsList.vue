<script setup>
import { onMounted, inject } from 'vue';
import ConversationsListItem from './ConversationsListItem.vue';

defineEmits(['start-conversation', 'select-conversation']);
const props = defineProps({
  conversations: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const socket = inject('socket');
const currentUser = inject('currentUser');

const sendNotification = () => {
  const message = prompt('Entrez le message à envoyer');
  socket.emit('commercial notification', message);
};

onMounted(async () => {

});
</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 overflow-y-auto">
    <button
      v-if="currentUser.role === 'admin'"
      class="m-3 bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto"
      @click="sendNotification">
      Envoyer une notification
    </button>
    <button
      class="m-3 bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto"
      @click="$emit('start-conversation')">
      Démarrer une conversation
    </button>
    <!-- <TransitionGroup name="fade" tag="ul"> -->
    <ConversationsListItem v-for="conversation in conversations" :key="conversation.id" :conversation="conversation"
      @click="$emit('select-conversation', conversation)" />
    <!-- </TransitionGroup> -->
  </ul>
</template>
