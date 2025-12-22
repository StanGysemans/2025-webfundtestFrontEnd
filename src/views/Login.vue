<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>Login</h2>
        <button class="modal-close" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleLogin">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" v-model="loginForm.email" required :disabled="loading" />
          </div>
          <div class="form-group">
            <label>Wachtwoord</label>
            <input type="password" v-model="loginForm.password" required :disabled="loading" />
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Inloggen...' : 'Inloggen' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'login'])

const { login: loginUser } = useAuth()
const loginForm = ref({
  email: '',
  password: ''
})
const error = ref('')
const loading = ref(false)

const close = () => {
  emit('close')
  loginForm.value = {
    email: '',
    password: ''
  }
  error.value = ''
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    const result = await loginUser(loginForm.value.email, loginForm.value.password)
    
    if (result.success) {
      emit('login', result.user)
      close()
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'Er is een fout opgetreden bij het inloggen'
  } finally {
    loading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    loginForm.value = {
      email: '',
      password: ''
    }
    error.value = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid #1f1f1f;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #1f1f1f;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 24px;
  color: #9b5cff;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #eaeaea;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  color: #eaeaea;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #9b5cff;
  box-shadow: 0 0 0 3px rgba(155, 92, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.btn-submit {
  width: 100%;
  padding: 14px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* Custom Scrollbar for Modal */
.modal::-webkit-scrollbar {
  width: 8px;
}

.modal::-webkit-scrollbar-track {
  background: rgba(15, 15, 15, 0.5);
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb {
  background: rgba(155, 92, 255, 0.3);
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 92, 255, 0.5);
}

.modal {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 92, 255, 0.3) rgba(15, 15, 15, 0.5);
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
