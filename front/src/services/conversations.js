export const getUserConversations = async (userId) => {
  const res = await fetch(`http://localhost:3000/api/conversations/user/${userId}`, { credentials: 'include' });
  return res.json();
};
export const getConversationsBy = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`http://localhost:3000/api/conversations?${whereClause}`, { credentials: 'include' });
  return res.json();
};
export const createConversation = async (users) => {
  const res = await fetch('http://localhost:3000/api/conversations', {
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
