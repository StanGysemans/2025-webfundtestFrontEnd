import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service.js'

// Global auth state
const user = ref(null)
const token = ref(localStorage.getItem('authToken') || null)

// Initialize user from localStorage
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
  } catch (e) {
    console.error('Error parsing stored user:', e)
  }
}

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      token.value = response.token
      user.value = response.user
      
      // Store in localStorage
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return { success: true, user: response.user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return { success: true, user: response.user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  return {
    user: currentUser,
    token,
    isAuthenticated,
    login,
    register,
    logout
  }
}

