<template>
  <nav class="sidebar">
    <div class="logo">
      <span>MyApp</span>
    </div>

    <ul class="nav-links">
      <li>
        <RouterLink to="/" active-class="active">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/dashboard" active-class="active">Dashboard</RouterLink>
      </li>
      <li>
        <RouterLink to="/login" active-class="active">Login</RouterLink>
      </li>
      <li>
        <RouterLink to="/profile" active-class="active">Profile</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #0f0f0f;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 24px;
  font-size: 20px;
  font-weight: bold;
  color: #9b5cff;
  border-bottom: 1px solid #2a2a2a;
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
}

.nav-links a:hover {
  background-color: #1a1a1a;
  color: #9b5cff;
}

.active {
  background-color: #1f1f1f;
  color: #9b5cff;
  border-left: 4px solid #9b5cff;
}
</style>
