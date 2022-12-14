export const getPendingRequests = async () => {
  const res = await fetch('http://localhost:3000/api/requests', { credentials: 'include' });
  return res.json();
};
