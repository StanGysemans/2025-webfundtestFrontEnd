import api from '@/config/api.js'

export const friendsService = {
  // Get all friends (requires auth)
  async getAll() {
    const response = await api.get('/friends')
    return response.data
  },

  // Get friend by ID (requires auth)
  async getById(id) {
    const response = await api.get(`/friends/${id}`)
    return response.data
  },

  // Get pending friend requests (requires auth)
  async getPendingRequests() {
    const response = await api.get('/friends/pending')
    return response.data
  },

  // Create friend request (requires auth)
  async createRequest(userId2) {
    const response = await api.post('/friends', {
      UserID2: userId2
    })
    return response.data
  },

  // Accept friend request (requires auth)
  async acceptRequest(id) {
    const response = await api.put(`/friends/${id}/accept`)
    return response.data
  },

  // Block friend (requires auth)
  async blockFriend(id) {
    const response = await api.put(`/friends/${id}/block`)
    return response.data
  },

  // Delete/Remove friend (requires auth)
  async delete(id) {
    const response = await api.delete(`/friends/${id}`)
    return response.data
  }
}

