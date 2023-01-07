<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { FulfillingBouncingCircleSpinner } from 'epic-spinners';
import { ref } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/20/solid';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import Login from './components/LoginForm.vue';
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <template v-if="Component">
      <Transition mode="out-in" name="fade">
        <Suspense>
          <!-- main content -->
          <component :is="Component" :key="route.path" />
          <!-- loading state -->
          <template #fallback>
            <pulse-loader class="mx-auto w-full top-1/2 left-1/2" />
          </template>
        </Suspense>
      </Transition>
    </template>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
