import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
    },
  ],
});

router.beforeEach(async (to, from) => {
  var options = {
    method: "GET",
    credentials: "include",
    withCredentials: true,
  };
  fetch("http://localhost:3000/api/auth", options).then(function (response) {
    if (response.status === 200) {
      return true;
    } else {
      return { name: "Login" };
    }
  });
});

export default router;
