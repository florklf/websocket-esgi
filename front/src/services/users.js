export const fetchCurrentUser = async () => {
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/users/me`, { credentials: 'include' });
  return res.json();
};
export const fetchUsers = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/api/users?${whereClause}`);
  return res.json();
};
