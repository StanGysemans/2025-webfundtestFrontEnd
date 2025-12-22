<template>
  <main class="content">
    <!-- ID CARD -->
    <section class="id-card-section">
      <div class="id-card">
        <div class="id-card-header">
          <h2>UitgaansFinder</h2>
          <span class="id-type">ID Kaart</span>
        </div>
        
        <div class="id-card-body">
          <div class="id-photo-section">
            <div 
              class="id-photo" 
              :style="{ background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColorDark} 100%)` }"
            >
              <span class="id-initials">{{ userInitials }}</span>
            </div>
            <button class="color-picker-btn" @click="showColorPicker = !showColorPicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="13.5" cy="6.5" r=".5"></circle>
                <circle cx="17.5" cy="10.5" r=".5"></circle>
                <circle cx="8.5" cy="7.5" r=".5"></circle>
                <circle cx="6.5" cy="12.5" r=".5"></circle>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.688-.469-1.125-.469-.437 0-.835.18-1.125.469-.289.29-.469.688-.469 1.125 0 .942.722 1.688 1.648 1.688 6.5 0 10-4.5 10-10S18.5 2 12 2z"></path>
              </svg>
              Kleur
            </button>
            
            <!-- Color Picker -->
            <div v-if="showColorPicker" class="color-picker">
              <div 
                v-for="color in colorOptions" 
                :key="color.name"
                class="color-option"
                :class="{ active: avatarColor === color.value }"
                :style="{ background: color.value }"
                @click="selectColor(color)"
              ></div>
            </div>
          </div>
          
          <div class="id-info">
            <div class="id-field">
              <span class="id-label">Naam:</span>
              <span class="id-value">{{ userInfo.firstName }} {{ userInfo.lastName }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Leeftijd:</span>
              <span class="id-value">{{ userInfo.age }} jaar</span>
            </div>
            <div class="id-field">
              <span class="id-label">Stad:</span>
              <span class="id-value">{{ userInfo.campusCity }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Geslacht:</span>
              <span class="id-value">{{ userInfo.gender }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Bio:</span>
              <span class="id-value">{{ userInfo.bio || 'Geen bio' }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Rol:</span>
              <span class="id-value role-badge" :class="userInfo.role.toLowerCase()">
                {{ userInfo.role }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="id-card-footer">
          <div class="auth-buttons">
            <button class="btn-auth" @click="showLogin = true">Login</button>
            <button class="btn-auth" @click="showRegister = true">Registreren</button>
          </div>
        </div>
      </div>
    </section>

    <!-- VENUE REGISTRATION (Only for Venue Owners) -->
    <section v-if="isVenueOwner" class="venue-registration-section">
      <div class="id-card venue-card">
        <div class="id-card-header">
          <h2>Venue Registratie</h2>
          <span class="id-type">Eigenaar</span>
        </div>
        
        <div class="id-card-body">
          <div class="venue-list">
            <div 
              v-for="(venue, index) in userVenues" 
              :key="index"
              class="venue-item"
            >
              <div class="venue-info">
                <h3>{{ venue.name || 'Nieuw Venue' }}</h3>
                <p>{{ venue.description || 'Geen beschrijving' }}</p>
                <span class="venue-type">{{ venue.type || 'Geen type' }}</span>
              </div>
              <button class="btn-edit" @click="editVenue(index)">Bewerken</button>
            </div>
            
            <button class="btn-add-venue" @click="showAddVenue = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Venue Toevoegen
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- LOGIN MODAL -->
    <div v-if="showLogin" class="modal-overlay" @click.self="showLogin = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Login</h2>
          <button class="modal-close" @click="showLogin = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label>E-mail</label>
              <input type="email" v-model="loginForm.email" required />
            </div>
            <div class="form-group">
              <label>Wachtwoord</label>
              <input type="password" v-model="loginForm.password" required />
            </div>
            <button type="submit" class="btn-submit">Inloggen</button>
          </form>
        </div>
      </div>
    </div>

    <!-- REGISTER MODAL -->
    <div v-if="showRegister" class="modal-overlay" @click.self="showRegister = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Registreren</h2>
          <button class="modal-close" @click="showRegister = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label>Voornaam</label>
              <input type="text" v-model="registerForm.firstName" required />
            </div>
            <div class="form-group">
              <label>Achternaam</label>
              <input type="text" v-model="registerForm.lastName" required />
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input type="email" v-model="registerForm.email" required />
            </div>
            <div class="form-group">
              <label>Wachtwoord</label>
              <input type="password" v-model="registerForm.password" required />
            </div>
            <div class="form-group">
              <label>Leeftijd</label>
              <input type="number" v-model="registerForm.age" required />
            </div>
            <div class="form-group">
              <label>Stad</label>
              <input type="text" v-model="registerForm.campusCity" required />
            </div>
            <div class="form-group">
              <label>Geslacht</label>
              <select v-model="registerForm.gender" required>
                <option value="">Selecteer</option>
                <option value="Man">Man</option>
                <option value="Vrouw">Vrouw</option>
                <option value="Anders">Anders</option>
              </select>
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea v-model="registerForm.bio" rows="3"></textarea>
            </div>
            <button type="submit" class="btn-submit">Registreren</button>
          </form>
        </div>
      </div>
    </div>

    <!-- ADD/EDIT VENUE MODAL -->
    <div v-if="showAddVenue || editingVenueIndex !== null" class="modal-overlay" @click.self="closeVenueModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingVenueIndex !== null ? 'Venue Bewerken' : 'Nieuw Venue' }}</h2>
          <button class="modal-close" @click="closeVenueModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveVenue">
            <div class="form-group">
              <label>Venue Naam</label>
              <input type="text" v-model="venueForm.name" required />
            </div>
            <div class="form-group">
              <label>Beschrijving</label>
              <textarea v-model="venueForm.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select v-model="venueForm.type" required>
                <option value="">Selecteer type</option>
                <option value="Club">Club</option>
                <option value="Bar">Bar</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Café">Café</option>
                <option value="Evenement">Evenement</option>
              </select>
            </div>
            <div class="form-group">
              <label>Adres</label>
              <input type="text" v-model="venueForm.address" />
            </div>
            <div class="form-group">
              <label>Stad</label>
              <input type="text" v-model="venueForm.city" />
            </div>
            <div class="form-group">
              <label>Max Capaciteit</label>
              <input type="number" v-model="venueForm.maxCap" />
            </div>
            <button type="submit" class="btn-submit">Opslaan</button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

// User Info (Placeholder - Later van API)
const userInfo = ref({
  firstName: 'Jan',
  lastName: 'Jansen',
  age: 25,
  campusCity: 'Amsterdam',
  gender: 'Man',
  bio: 'Liefhebber van uitgaan en nieuwe plekken ontdekken',
  role: 'User' // User, VenueOwner, Admin
})

// Avatar Color Personalization
const avatarColor = ref('#9b5cff')
const avatarColorDark = ref('#6d28d9')
const showColorPicker = ref(false)

const colorOptions = [
  { name: 'Paars', value: '#9b5cff', dark: '#6d28d9' },
  { name: 'Blauw', value: '#3b82f6', dark: '#1e40af' },
  { name: 'Groen', value: '#10b981', dark: '#059669' },
  { name: 'Rood', value: '#ef4444', dark: '#dc2626' },
  { name: 'Oranje', value: '#f59e0b', dark: '#d97706' },
  { name: 'Roze', value: '#ec4899', dark: '#be185d' },
  { name: 'Cyaan', value: '#06b6d4', dark: '#0891b2' },
  { name: 'Geel', value: '#eab308', dark: '#ca8a04' }
]

const selectColor = (color) => {
  avatarColor.value = color.value
  avatarColorDark.value = color.dark
  showColorPicker.value = false
}

const userInitials = computed(() => {
  return `${userInfo.value.firstName[0]}${userInfo.value.lastName[0]}`.toUpperCase()
})

const isVenueOwner = computed(() => {
  return userInfo.value.role === 'VenueOwner' || userInfo.value.role === 'Admin'
})

// Modals
const showLogin = ref(false)
const showRegister = ref(false)
const showAddVenue = ref(false)
const editingVenueIndex = ref(null)

// Forms
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  age: null,
  campusCity: '',
  gender: '',
  bio: ''
})

const venueForm = ref({
  name: '',
  description: '',
  type: '',
  address: '',
  city: '',
  maxCap: null
})

// User Venues
const userVenues = ref([
  // Placeholder - Later van API
])

const handleLogin = () => {
  // Placeholder: Later koppelen aan API
  console.log('Login:', loginForm.value)
  // TODO: API call
  showLogin.value = false
}

const handleRegister = () => {
  // Placeholder: Later koppelen aan API
  console.log('Register:', registerForm.value)
  // TODO: API call
  showRegister.value = false
}

const editVenue = (index) => {
  editingVenueIndex.value = index
  venueForm.value = { ...userVenues.value[index] }
}

const saveVenue = () => {
  if (editingVenueIndex.value !== null) {
    // Edit existing venue
    userVenues.value[editingVenueIndex.value] = { ...venueForm.value }
  } else {
    // Add new venue
    userVenues.value.push({ ...venueForm.value })
  }
  closeVenueModal()
}

const closeVenueModal = () => {
  showAddVenue.value = false
  editingVenueIndex.value = null
  venueForm.value = {
    name: '',
    description: '',
    type: '',
    address: '',
    city: '',
    maxCap: null
  }
}
</script>

<style scoped>
.content {
  flex: 1;
  padding: 64px;
  color: #eaeaea;
  background-color: #0f0f0f;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

/* ID CARD */
.id-card-section {
  width: 100%;
  max-width: 600px;
}

.id-card {
  background: rgba(18, 18, 18, 0.85);
  border: 2px solid #1f1f1f;
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.id-card-header {
  background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.id-card-header h2 {
  font-size: 24px;
  color: white;
  margin: 0;
}

.id-type {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.id-card-body {
  padding: 32px;
  display: flex;
  gap: 32px;
}

.id-photo-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.id-photo {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.id-initials {
  font-size: 36px;
  font-weight: 700;
  color: white;
}

.color-picker-btn {
  padding: 8px 12px;
  background: rgba(155, 92, 255, 0.1);
  border: 1px solid #9b5cff;
  border-radius: 8px;
  color: #9b5cff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.color-picker-btn:hover {
  background: rgba(155, 92, 255, 0.2);
}

.color-picker {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: white;
}

.color-option.active {
  border-color: #9b5cff;
  box-shadow: 0 0 0 2px rgba(155, 92, 255, 0.5);
}

.id-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.id-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.id-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.id-value {
  font-size: 16px;
  color: #eaeaea;
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
}

.role-badge.venueowner {
  background: rgba(155, 92, 255, 0.2);
  color: #9b5cff;
  border: 1px solid rgba(155, 92, 255, 0.3);
}

.role-badge.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.role-badge.user {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.id-card-footer {
  padding: 24px 32px;
  background: rgba(15, 15, 15, 0.5);
  border-top: 1px solid #1f1f1f;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.btn-auth {
  flex: 1;
  padding: 12px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-auth:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* VENUE REGISTRATION */
.venue-registration-section {
  width: 100%;
  max-width: 600px;
}

.venue-card {
  border-color: #9b5cff;
}

.venue-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.venue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
  border-radius: 12px;
}

.venue-info h3 {
  color: #9b5cff;
  font-size: 18px;
  margin: 0 0 4px 0;
}

.venue-info p {
  color: #cfcfcf;
  font-size: 14px;
  margin: 0 0 8px 0;
}

.venue-type {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(155, 92, 255, 0.1);
  border: 1px solid rgba(155, 92, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #9b5cff;
}

.btn-edit {
  padding: 8px 16px;
  background: rgba(155, 92, 255, 0.1);
  border: 1px solid #9b5cff;
  border-radius: 8px;
  color: #9b5cff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background: rgba(155, 92, 255, 0.2);
}

.btn-add-venue {
  width: 100%;
  padding: 16px;
  background: rgba(155, 92, 255, 0.1);
  border: 2px dashed #9b5cff;
  border-radius: 12px;
  color: #9b5cff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add-venue:hover {
  background: rgba(155, 92, 255, 0.2);
  border-style: solid;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid #1f1f1f;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #1f1f1f;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 24px;
  color: #9b5cff;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #eaeaea;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  color: #eaeaea;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #9b5cff;
  box-shadow: 0 0 0 3px rgba(155, 92, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.btn-submit {
  width: 100%;
  padding: 14px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* Custom Scrollbar for Modal */
.modal::-webkit-scrollbar {
  width: 8px;
}

.modal::-webkit-scrollbar-track {
  background: rgba(15, 15, 15, 0.5);
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb {
  background: rgba(155, 92, 255, 0.3);
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 92, 255, 0.5);
}

.modal {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 92, 255, 0.3) rgba(15, 15, 15, 0.5);
}
</style>
