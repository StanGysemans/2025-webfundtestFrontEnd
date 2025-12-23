import api from '@/config/api.js'

export const chatsService = {
  // Get all chats for current user
  async getAll() {
    const response = await api.get('/chats')
    return response.data
  },

  // Get chat by ID
  async getById(chatId) {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  },

  // Create or get chat between two users
  async createChat(userId2) {
    const response = await api.post('/chats', { UserID2: userId2 })
    return response.data
  },

  // Get messages for a chat
  async getMessages(chatId) {
    const response = await api.get(`/chats/${chatId}/messages`)
    return response.data
  },

  // Send a message
  async sendMessage(chatId, messageText) {
    const response = await api.post(`/chats/${chatId}/messages`, {
      MessageText: messageText
    })
    return response.data
  }
}

