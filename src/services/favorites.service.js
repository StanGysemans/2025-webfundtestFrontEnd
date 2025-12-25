import api from '@/config/api.js'

export const favoritesService = {
  // Get all favorites for the authenticated user
  async getAll() {
    const response = await api.get('/favorites')
    return response.data
  },

  // Get favorite by ID
  async getById(id) {
    const response = await api.get(`/favorites/${id}`)
    return response.data
  },

  // Add venue to favorites
  async add(venueId) {
    const response = await api.post('/favorites', {
      VenueID: venueId
    })
    return response.data
  },

  // Remove favorite by favorite ID
  async remove(favoriteId) {
    const response = await api.delete(`/favorites/${favoriteId}`)
    return response.data
  },

  // Remove favorite by venue ID (more convenient)
  async removeByVenue(venueId) {
    const response = await api.delete(`/favorites/venue/${venueId}`)
    return response.data
  },

  // Check if a venue is favorited (returns favorite object or null)
  async isFavorited(venueId) {
    try {
      const favorites = await this.getAll()
      return favorites.find(fav => fav.VenueID === venueId || fav.venue?.VenueID === venueId) || null
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return null
    }
  }
}

