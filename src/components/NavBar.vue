<template>
  <nav class="sidebar">
    <div class="logo">
      <div class="logo-wrapper">
        <img :src="logo" alt="UitgaansFinder logo" />
      </div>
    </div>

    <ul class="nav-links">
      <li>
        <RouterLink to="/" active-class="active">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/map" active-class="active">Map</RouterLink>
      </li>
      <li>
        <RouterLink to="/clublist" active-class="active">ClubList</RouterLink>
      </li>
      <li>
        <RouterLink to="/social" active-class="active">Social</RouterLink>
      </li>
      <li>
        <RouterLink to="/profile" active-class="active">Profile</RouterLink>
      </li>
      <li v-if="isAdmin">
        <RouterLink to="/admin/role-requests" active-class="active">Admin</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import logo from '@/assets/UitgaansFinderLogo.png'

const { user, isAuthenticated } = useAuth()

const isAdmin = computed(() => {
  if (!isAuthenticated.value || !user.value) return false
  const role = user.value.Role || ''
  return role === 'Admin' || role === 'admin'
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #0b0b0b;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  overflow-y: auto;
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-links a {
  display: block;
  padding: 14px 24px;
  color: #cfcfcf;
  text-decoration: none;
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.nav-links a:hover {
  background-color: #1f1f1f;
  color: #9b5cff;
  border-left: 4px solid #9b5cff;
}

.active {
  background-color: #1f1f1f;
  color: #9b5cff;
  border-left: 4px solid #9b5cff;
}

.logo {
  padding: 24px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #1f1f1f;
}

.logo-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(155, 92, 255, 0.45),
    rgba(11, 11, 11, 0.95) 70%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 22px rgba(155, 92, 255, 0.5);
}

.logo-wrapper img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: contain;
}

</style>
