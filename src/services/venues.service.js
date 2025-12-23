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

  // Create new venue (BASE ONLY - no address/contact/foto/status)
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
  },

  // ===== VENUE ADDRESS =====
  async getAddresses(venueId) {
    const response = await api.get(`/venues/${venueId}/addresses`)
    return response.data
  },

  async createAddress(venueId, addressData) {
    const response = await api.post(`/venues/${venueId}/addresses`, addressData)
    return response.data
  },

  async updateAddress(venueId, addressId, addressData) {
    const response = await api.put(`/venues/${venueId}/addresses/${addressId}`, addressData)
    return response.data
  },

  async deleteAddress(venueId, addressId) {
    const response = await api.delete(`/venues/${venueId}/addresses/${addressId}`)
    return response.data
  },

  // ===== VENUE CONTACT =====
  async getContacts(venueId) {
    const response = await api.get(`/venues/${venueId}/contacts`)
    return response.data
  },

  async createContact(venueId, contactData) {
    const response = await api.post(`/venues/${venueId}/contacts`, contactData)
    return response.data
  },

  async updateContact(venueId, contactId, contactData) {
    const response = await api.put(`/venues/${venueId}/contacts/${contactId}`, contactData)
    return response.data
  },

  async deleteContact(venueId, contactId) {
    const response = await api.delete(`/venues/${venueId}/contacts/${contactId}`)
    return response.data
  },

  // ===== VENUE FOTO =====
  async getFotos(venueId) {
    const response = await api.get(`/venues/${venueId}/fotos`)
    return response.data
  },

  async createFoto(venueId, fotoData) {
    const response = await api.post(`/venues/${venueId}/fotos`, fotoData)
    return response.data
  },

  async updateFoto(venueId, fotoId, fotoData) {
    const response = await api.put(`/venues/${venueId}/fotos/${fotoId}`, fotoData)
    return response.data
  },

  async deleteFoto(venueId, fotoId) {
    const response = await api.delete(`/venues/${venueId}/fotos/${fotoId}`)
    return response.data
  },

  // ===== VENUE STATUS =====
  async getStatuses(venueId) {
    const response = await api.get(`/venues/${venueId}/statuses`)
    return response.data
  },

  async getLatestStatus(venueId) {
    const response = await api.get(`/venues/${venueId}/statuses/latest`)
    return response.data
  },

  async createStatus(venueId, statusData) {
    const response = await api.post(`/venues/${venueId}/statuses`, statusData)
    return response.data
  },

  async updateStatus(venueId, statusId, statusData) {
    const response = await api.put(`/venues/${venueId}/statuses/${statusId}`, statusData)
    return response.data
  },

  async deleteStatus(venueId, statusId) {
    const response = await api.delete(`/venues/${venueId}/statuses/${statusId}`)
    return response.data
  }
}

