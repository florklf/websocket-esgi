<script setup>
import { ref, onBeforeMount, inject } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue';
import { updateConversation } from '../../../store';
import { editConversation } from '../../../services/conversations';

const props = defineProps(({
  isOpen: {
    type: Boolean,
    required: true,
  },
}));

const isOpen = ref(props.isOpen);
const conversation = inject('conversation');
const socket = inject('socket');

function closeModal() {
  isOpen.value = false;
}

const editConv = async (e) => {
  if ((e.type === 'keypress' && (e.key === 'Enter' || e.keyCode === 13)) || e.type === 'click') {
    const content = conversation.value.max_users;
    if (!content) return;
    conversation.value = await editConversation(conversation.value.id, { max_users: content });
    updateConversation(conversation.value);
    socket.emit('updated conversation', conversation.value);
    isOpen.value = false;
  }
};
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Edit conversation
              </DialogTitle>
              <div class="mt-4">
                <label for="name" class="block text-sm font-medium text-gray-700">Max users</label>
                <p class="text-xs text-gray-500">
                  Définit le nombre maximum de personnes pouvant rejoindre la conversation.
                </p>
                <input v-model="conversation.max_users" type="number" class="bg-gray-100 block rounded-md border-gray-500 shadow-sm mt-2" @keypress="editConv" />
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="editConv"
                >
                  Save changes
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
