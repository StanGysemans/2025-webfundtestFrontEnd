import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
    { path: '/login', component: Login },
    { path: '/profile', component: Profile}
  ]
})

export default router
