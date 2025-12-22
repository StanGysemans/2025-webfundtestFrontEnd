import api from '@/config/api.js'

export const usersService = {
  // Get current user (requires auth)
  async getCurrentUser() {
    // We need to get the user ID from the token, but we can use the /users/:id endpoint
    // First, we'll need to decode the token or have an endpoint that returns current user
    // For now, we'll use getUserById with the user ID from auth
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.UserID) {
      return this.getById(user.UserID)
    }
    throw new Error('No user ID found')
  },

  // Get user by ID (requires auth)
  async getById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // Update user (requires auth)
  async update(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  }
}

