<script setup>
import { onMounted, ref } from 'vue';
import ConversationsListItem from './ConversationsListItem.vue';

// const users = ref();
defineEmits(['start-conversation', 'select-conversation']);
const props = defineProps({
  users: {
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
    <button @click="$emit('start-conversation')">
      Démarrer une conversation
    </button>
    <ConversationsListItem v-for="user in users" :key="user.id" :username="user.username" @click="$emit('select-conversation', user)" />
  <!-- </TransitionGroup> -->
  </ul>
</template>
