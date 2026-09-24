import Vue from 'vue';
import VueRouter from 'vue-router';

import LandingPage from '@/views/LandingPage.vue';
import BooksPage from '@/views/BooksPage.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/books', name: 'Books', component: BooksPage },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
