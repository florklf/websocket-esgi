import { ref, reactive } from 'vue';
import { getUserConversations, getConversationsBy } from './services/conversations';
import { fetchCurrentUser, fetchUsers } from './services/users';

export const currentUser = ref();
export const joinedConversations = ref();
export const groupConversations = ref();

export const getCurrentUser = async () => {
  currentUser.value = await fetchCurrentUser();
};

export const updateConversation = (conv) => {
  const existingJoinedConversation = joinedConversations.value.findIndex((c) => c.id === conv.id);
  const existingGroupConversation = groupConversations.value.findIndex((c) => c.id === conv.id);
  if (existingJoinedConversation !== -1) {
    joinedConversations.value.splice(existingJoinedConversation, 1, conv);
  }
  if (existingGroupConversation !== -1) {
    groupConversations.value.splice(existingGroupConversation, 1, conv);
  }
};

export const addConversation = (conversation) => {
  if (joinedConversations.value.length) {
    joinedConversations.value.unshift(conversation);
  } else {
    joinedConversations.value = [conversation];
  }
};

export const removeConversation = (conversation) => {
  const index = joinedConversations.value.findIndex((c) => c.id === conversation.id);
  if (index !== -1) {
    joinedConversations.value.splice(index, 1);
  }
};
