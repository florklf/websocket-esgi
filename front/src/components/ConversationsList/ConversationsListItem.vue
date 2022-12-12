<script setup>
defineProps({
  username: String,
});
</script>

<template>
  <li class="hover:bg-gray-100 relative flex items-center py-6 pl-6 pr-20">
    <div class="relative flex min-w-0 flex-1 items-center">
      <span class="relative inline-block flex-shrink-0">
        <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
        <!-- Online: "bg-green-400", Offline: "bg-gray-300" -->
        <span class="bg-green-400 absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white" aria-hidden="true" />
      </span>
      <div class="ml-4 truncate">
        <p class="truncate text-sm font-medium text-gray-900">
          {{ username }}
        </p>
      </div>
    </div>
  </li>
</template>
