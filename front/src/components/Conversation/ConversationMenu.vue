<script setup>
import {
  ref, inject, onMounted, computed, onBeforeMount, onBeforeUnmount, nextTick,
} from 'vue';
import {
  Menu, MenuButton, MenuItems, MenuItem,
} from '@headlessui/vue';
import { PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/vue/20/solid';
import EditModal from './Modal/EditModal.vue';
import { currentUser } from '../../store';
import DeleteModal from './Modal/DeleteModal.vue';

const openedEditModal = ref(false);
const openedDeleteModal = ref(false);
const editModalKey = ref(0);
const deleteModalKey = ref(0);

const openEditModal = () => {
  openedEditModal.value = true;
  editModalKey.value = Math.random();
};
const openDeleteModal = () => {
  openedDeleteModal.value = true;
  deleteModalKey.value = Math.random();
};
</script>

<template>
  <EditModal v-if="currentUser.role_id === 2" :key="editModalKey" :is-open="openedEditModal" />
  <DeleteModal :key="deleteModalKey" :is-open="openedDeleteModal" />
  <Menu as="div" class="relative inline-block text-left">
    <div>
      <MenuButton
        class="inline-flex w-full justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Options
        <ChevronDownIcon
          class="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
          aria-hidden="true"
        />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div v-if="currentUser.role_id === 2" class="px-1 py-1">
          <MenuItem v-slot="{ active }" @click="openEditModal()">
            <button
              :class="[
                active ? 'bg-violet-500 text-white' : 'text-gray-900',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]"
            >
              <PencilIcon
                :active="active"
                class="mr-2 h-5 w-5 text-violet-400"
                aria-hidden="true"
              />
              Edit
            </button>
          </MenuItem>
        </div>
        <div class="px-1 py-1">
          <MenuItem v-slot="{ active }" @click="openDeleteModal()">
            <button
              :class="[
                active ? 'bg-violet-500 text-white' : 'text-gray-900',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]"
            >
              <TrashIcon
                :active="active"
                class="mr-2 h-5 w-5 text-violet-400"
                aria-hidden="true"
              />
              Delete
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
