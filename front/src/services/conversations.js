export const getUserConversations = async (userId) => {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations/user/${userId}`, { credentials: 'include' });
  return res.json();
};
export const getConversationsBy = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations?${whereClause}`, { credentials: 'include' });
  return res.json();
};
export const createConversation = async (users) => {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      users,
    }),
  });
  return res.json();
};
export const getConversationById = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations/${id}`, { credentials: 'include' });
  return res.json();
};
export const editConversation = async (id, where) => {
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...where }),
    credentials: 'include',
  };
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations/${id}`, requestOptions);
  return res.json();
};

export const deleteConversation = async (id) => {
  const requestOptions = {
    method: 'DELETE',
    credentials: 'include',
  };
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/conversations/${id}`, requestOptions);
  return res.json();
};
