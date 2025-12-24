import api from '@/config/api.js'

export const venuePingService = {
  // Get aggregated crowd level for a venue
  async getCrowdLevel(venueId, minutes = 30) {
    const response = await api.get(`/venues/${venueId}/pings/crowd-level?minutes=${minutes}`)
    return response.data
  },

  // Create a ping
  async createPing(venueId, percentage) {
    const response = await api.post(`/venues/${venueId}/pings`, { percentage })
    return response.data
  },

  // Update an existing ping
  async updatePing(venueId, percentage, pingId) {
    const response = await api.put(`/venues/${venueId}/pings`, { percentage, pingId })
    return response.data
  },

  // Get user's recent ping for a venue
  async getUserPing(venueId) {
    try {
      const response = await api.get(`/venues/${venueId}/pings/me`)
      return response.data
    } catch (error) {
      // If no ping found, return null instead of throwing
      if (error.response?.status === 401) {
        return null
      }
      // If response is null (no ping found), that's okay
      if (!error.response || error.response.status >= 500) {
        throw error
      }
      return null
    }
  },

  // Get recent pings for a venue
  async getRecentPings(venueId, minutes = 30) {
    const response = await api.get(`/venues/${venueId}/pings/recent?minutes=${minutes}`)
    return response.data
  }
}

