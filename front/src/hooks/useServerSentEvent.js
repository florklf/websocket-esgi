import { ref, onMounted, onUnmounted } from 'vue';

export const useServerSentEvent = (url, userId) => {
  const eventSource = ref(new EventSource(`${url}?userId=${userId}`));
  const events = ref({});

  const on = (event, listener) => {
    events.value = {
      ...events.value,
      [event]: listener
    }

    eventSource.value.addEventListener(event, listener)
  }

  onMounted(() => {
    Object.entries(events.value).forEach(([event, listener]) => {
      eventSource.value.addEventListener(event, listener)
    })
  })

  onUnmounted(() => {
    Object.entries(events.value).forEach(([event, listener]) => {
      eventSource.value.removeEventListener(event, listener)
    })

    eventSource.value.close();
  })

  return on;
};