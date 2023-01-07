export const fetchCurrentUser = async () => {
  const res = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
  return res.json();
};
export const fetchUsers = async (where) => {
  const whereClause = new URLSearchParams(where).toString();
  const res = await fetch(`http://localhost:3000/api/users?${whereClause}`);
  return res.json();
};
