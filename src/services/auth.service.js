import api from '@/config/api.js'

export const authService = {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', {
      FirstName: userData.firstName,
      LastName: userData.lastName,
      Email: userData.email,
      Password: userData.password,
      Age: userData.age,
      CampusCity: userData.campusCity,
      Gender: userData.gender,
      Bio: userData.bio
    })
    return response.data
  },

  // Login user
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    })
    return response.data
  }
}

