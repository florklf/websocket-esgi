export const getPendingRequests = async () => {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/requests`, { credentials: 'include' });
  return res.json();
};
