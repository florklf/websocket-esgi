<script setup>
import { onMounted, ref } from 'vue';
import ConversationsListItem from './ConversationsListItem.vue';

defineEmits(['start-conversation', 'select-conversation']);
const props = defineProps({
  conversations: {
    type: Array,
    required: true,
    default: () => [],
  },
});
const fetchUsers = async () => {
  const res = await fetch('http://localhost:3000/api/users');
  return res.json();
};

onMounted(async () => {
  // try {
  //   users.value = await fetchUsers();
  // } catch (err) {
  //   console.log(err);
  // }
});
</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 overflow-y-auto">
    <!-- <TransitionGroup name="fade" tag="ul"> -->
    <button
      class="m-3 bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto"
      @click="$emit('start-conversation')">
      Démarrer une conversation
    </button>
    <ConversationsListItem v-for="conversation in conversations" :key="conversation.id" :conversation="conversation" @click="$emit('select-conversation', conversation)" />
  <!-- </TransitionGroup> -->
  </ul>
</template>
