import api from '@/config/api.js'

export const usersService = {
  // Get all users with optional search filter (requires auth)
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    
    const response = await api.get(`/users?${params.toString()}`)
    return response.data
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
  },

  // Location preferences
  async getLocationPreference() {
    const response = await api.get('/users/me/location-preference')
    return response.data
  },

  async updateLocationPreference(data) {
    const response = await api.put('/users/me/location-preference', data)
    return response.data
  }
}
