import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
  ],
});

const isAuth = async () => {
  const options = {
    method: 'GET',
    credentials: 'include',
    withCredentials: true,
  };
  const res = fetch(`${import.meta.env.VITE_BASE_API_URL}/api/auth`, options).then((response) => {
    if (response.status === 200) return true;
    return false;
  });
  return res;
};

router.beforeEach(async (to) => {
  try {
    const auth = await isAuth();
    if (!auth && to.name !== 'Login') return { name: 'Login' };
    if (auth && to.name === 'Login') return { name: 'home' };
  } catch (err) {
    console.log(err);
    return { name: 'Login' };
  }
  return true;
});

export default router;
