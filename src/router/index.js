import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Map from '@/views/Map.vue'
import ClubList from '@/views/ClubList.vue'
import Social from '@/views/Social.vue'
import Chat from '@/views/Chat.vue'
import AdminRoleRequests from '@/views/AdminRoleRequests.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/profile', component: Profile},
    { path: '/map', component: Map},
    { path: '/clublist', component: ClubList},
    { path: '/social', component: Social},
    { path: '/chat', component: Chat},
    { path: '/admin/role-requests', component: AdminRoleRequests}
  ]
})

export default router
