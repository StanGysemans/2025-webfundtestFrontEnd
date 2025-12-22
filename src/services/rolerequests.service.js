import api from '@/config/api.js'

export const roleRequestsService = {
  // Create role request (requires auth)
  async create(requestedRole, message = '') {
    const response = await api.post('/rolerequests', {
      requestedRole,
      message
    })
    return response.data
  },

  // Get all role requests (requires auth)
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.userId) params.append('userId', filters.userId)
    if (filters.status) params.append('status', filters.status)
    
    const response = await api.get(`/rolerequests?${params.toString()}`)
    return response.data
  },

  // Get role request by ID (requires auth)
  async getById(id) {
    const response = await api.get(`/rolerequests/${id}`)
    return response.data
  },

  // Update role request status (requires auth + admin role)
  async updateStatus(id, status) {
    const response = await api.put(`/rolerequests/${id}/status`, { status })
    return response.data
  },

  // Delete role request (requires auth)
  async delete(id) {
    const response = await api.delete(`/rolerequests/${id}`)
    return response.data
  }
}

