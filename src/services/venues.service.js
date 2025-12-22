import api from '@/config/api.js'

export const venuesService = {
  // Get all venues with optional filters
  async getAll(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.openStatus) params.append('openStatus', filters.openStatus)
    if (filters.venueTypes) params.append('venueTypes', filters.venueTypes)
    if (filters.crowdLevels) params.append('crowdLevels', filters.crowdLevels)
    
    const response = await api.get(`/venues?${params.toString()}`)
    return response.data
  },

  // Get venue by ID
  async getById(id) {
    const response = await api.get(`/venues/${id}`)
    return response.data
  },

  // Create new venue (requires auth + venue_owner role)
  async create(venueData) {
    const response = await api.post('/venues', venueData)
    return response.data
  },

  // Update venue (requires auth + venue_owner role)
  async update(id, venueData) {
    const response = await api.put(`/venues/${id}`, venueData)
    return response.data
  },

  // Delete venue (requires auth + venue_owner role)
  async delete(id) {
    const response = await api.delete(`/venues/${id}`)
    return response.data
  }
}

