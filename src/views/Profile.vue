<template>
  <main class="content">
    <!-- ID CARD -->
    <section class="id-card-section">
      <div class="id-card">
        <div class="id-card-header">
          <h2>UitgaansFinder</h2>
          <div class="header-right">
            <span class="id-type">ID Kaart</span>
            <button 
              v-if="isAuthenticated" 
              class="btn-edit-profile-small" 
              @click="showEditProfileModal = true"
              title="Profiel bewerken"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
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
              <span class="id-value">
                {{ userInfo.firstName || userInfo.lastName 
                  ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() 
                  : 'Niet ingelogd' }}
              </span>
            </div>
            <div class="id-field">
              <span class="id-label">Leeftijd:</span>
              <span class="id-value">{{ userInfo.age ? `${userInfo.age} jaar` : '-' }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Stad:</span>
              <span class="id-value">{{ userInfo.campusCity || '-' }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Geslacht:</span>
              <span class="id-value">{{ userInfo.gender || '-' }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Bio:</span>
              <span class="id-value">{{ userInfo.bio || 'Geen bio' }}</span>
            </div>
            <div class="id-field">
              <span class="id-label">Rol:</span>
              <div class="role-container">
                <span class="id-value role-badge" :class="(userInfo.role || 'user').toLowerCase()">
                  {{ userInfo.role || 'Geen rol' }}
                </span>
                <button 
                  v-if="!isAdmin && !isVenueOwner && isAuthenticated" 
                  class="btn-apply-role" 
                  @click="showRoleRequestModal = true"
                  :disabled="hasPendingRequest"
                >
                  {{ hasPendingRequest ? 'Aanvraag in behandeling' : 'Rol Aanvragen' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="id-card-footer">
          <div class="auth-buttons" v-if="!isAuthenticated">
            <button class="btn-auth" @click="showLogin = true">Login</button>
            <button class="btn-auth" @click="showRegister = true">Registreren</button>
          </div>
          <div v-else class="logout-button">
            <button class="btn-logout" @click="handleLogout">Uitloggen</button>
          </div>
        </div>
      </div>
    </section>

    <!-- OWNED VENUES (Under ID Card) -->
    <section v-if="(isVenueOwner || isAdmin) && userVenues.length > 0" class="owned-venues-section">
      <div class="id-card">
        <div class="id-card-header">
          <h2>Mijn Venues</h2>
        </div>
        <div class="id-card-body">
          <div class="venue-list">
            <div 
              v-for="(venue, index) in userVenues" 
              :key="venue.id || index"
              class="venue-item"
            >
              <div class="venue-info">
                <h3>{{ venue.name || 'Nieuw Venue' }}</h3>
                <p>{{ venue.description || 'Geen beschrijving' }}</p>
                <span class="venue-type">{{ venue.type || 'Geen type' }}</span>
                <div v-if="venue.address || venue.city" class="venue-location">
                  <span>{{ venue.address }}{{ venue.address && venue.city ? ', ' : '' }}{{ venue.city }}</span>
                </div>
              </div>
              <button class="btn-edit" @click="editVenue(index)">Bewerken</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ADD VENUE BUTTON (Under ID Card or Venues) -->
    <section v-if="isVenueOwner || isAdmin" class="add-venue-section">
      <button class="btn-add-venue-large" @click="showAddVenue = true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Venue Toevoegen
      </button>
    </section>

    <!-- LOGIN MODAL -->
    <Login 
      :isOpen="showLogin" 
      @close="showLogin = false"
      @login="handleLogin"
    />

    <!-- REGISTER MODAL -->
    <Register 
      :isOpen="showRegister" 
      @close="showRegister = false"
      @register="handleRegister"
    />

    <!-- EDIT PROFILE MODAL -->
    <div v-if="showEditProfileModal" class="modal-overlay" @click.self="showEditProfileModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Profiel Bewerken</h2>
          <button class="modal-close" @click="showEditProfileModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProfile">
            <div class="form-group">
              <label>Voornaam</label>
              <input type="text" v-model="editProfileForm.firstName" />
            </div>
            <div class="form-group">
              <label>Achternaam</label>
              <input type="text" v-model="editProfileForm.lastName" />
            </div>
            <div class="form-group">
              <label>Leeftijd</label>
              <input type="number" v-model.number="editProfileForm.age" min="0" max="150" />
            </div>
            <div class="form-group">
              <label>Stad</label>
              <input type="text" v-model="editProfileForm.campusCity" placeholder="bijv. Mechelen" />
            </div>
            <div class="form-group">
              <label>Geslacht</label>
              <select v-model="editProfileForm.gender">
                <option value="">Selecteer geslacht</option>
                <option value="Man">Man</option>
                <option value="Vrouw">Vrouw</option>
                <option value="Anders">Anders</option>
              </select>
            </div>
            <div class="form-group">
              <label>Bio</label>
              <textarea v-model="editProfileForm.bio" rows="4" placeholder="Vertel iets over jezelf..." maxlength="255"></textarea>
              <span class="char-count">{{ editProfileForm.bio.length }}/255</span>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showEditProfileModal = false">Annuleren</button>
              <button type="submit" class="btn-submit" :disabled="savingProfile">
                {{ savingProfile ? 'Opslaan...' : 'Opslaan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ROLE REQUEST MODAL -->
    <div v-if="showRoleRequestModal" class="modal-overlay" @click.self="showRoleRequestModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Rol Aanvraag</h2>
          <button class="modal-close" @click="showRoleRequestModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitRoleRequest">
            <div v-if="roleRequestError" class="error-message">
              {{ roleRequestError }}
            </div>
            <div v-if="roleRequestSuccess" class="success-message">
              {{ roleRequestSuccess }}
            </div>
            <div class="form-group">
              <label>Selecteer gewenste rol:</label>
              <select v-model="selectedRole" :disabled="roleRequestLoading" required>
                <option value="">Selecteer een rol</option>
                <option value="venue_owner">Venue Owner</option>
                <option value="admin">Website Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Waarom wil je deze rol?</label>
              <textarea 
                v-model="roleRequestMessage" 
                rows="4" 
                placeholder="Beschrijf waarom je deze rol wilt..."
                :disabled="roleRequestLoading"
              ></textarea>
            </div>
            <button type="submit" class="btn-submit" :disabled="roleRequestLoading || !selectedRole">
              {{ roleRequestLoading ? 'Verzenden...' : 'Aanvraag Verzenden' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- ADD/EDIT VENUE MODAL -->
    <div v-if="showAddVenue || editingVenueIndex !== null" class="modal-overlay" @click.self="closeVenueModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingVenueIndex !== null ? 'Venue Bewerken' : 'Nieuw Venue' }}</h2>
          <button 
            v-if="!editingVenueIndex" 
            class="btn-example" 
            @click="loadExampleData"
            title="Laad voorbeeld data"
          >
            📋 Voorbeeld
          </button>
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
              <label>Postcode</label>
              <input type="text" v-model="venueForm.postalCode" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Latitude</label>
                <input 
                  type="number" 
                  step="any" 
                  v-model="venueForm.lat" 
                  :disabled="geocodingInProgress"
                  placeholder="Wordt automatisch ingevuld"
                />
              </div>
              <div class="form-group">
                <label>Longitude</label>
                <input 
                  type="number" 
                  step="any" 
                  v-model="venueForm.lng" 
                  :disabled="geocodingInProgress"
                  placeholder="Wordt automatisch ingevuld"
                />
              </div>
            </div>
            <div v-if="geocodingInProgress" class="geocoding-status">
              <span>Coördinaten ophalen...</span>
            </div>
            <div v-if="geocodingError" class="geocoding-error">
              <span>{{ geocodingError }}</span>
            </div>
            <div class="form-group">
              <label>Max Capaciteit</label>
              <input type="number" v-model="venueForm.maxCap" />
            </div>
            <div class="form-group">
              <label>Gemiddelde Prijs</label>
              <input type="text" v-model="venueForm.averagePrice" placeholder="bijv. €10-€20" />
            </div>
            <div class="form-group">
              <label>Openingstijden</label>
              <div class="opening-hours-container">
                <div 
                  v-for="day in daysOfWeek" 
                  :key="day.key"
                  class="opening-hour-row"
                >
                  <div class="day-label">
                    <input 
                      type="checkbox" 
                      :id="`day-${day.key}`"
                      v-model="openingHours[day.key].enabled"
                    />
                    <label :for="`day-${day.key}`">{{ day.label }}</label>
                  </div>
                  <div v-if="openingHours[day.key].enabled" class="time-inputs">
                    <input 
                      type="time" 
                      v-model="openingHours[day.key].open"
                      class="time-input"
                    />
                    <span class="time-separator">-</span>
                    <input 
                      type="time" 
                      v-model="openingHours[day.key].close"
                      class="time-input"
                    />
                    <button 
                      type="button"
                      class="btn-copy-time"
                      @click="copyTimeToAll(day.key)"
                      title="Kopieer naar alle dagen"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  <span v-else class="closed-label">Gesloten</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="venueForm.email" />
            </div>
            <div class="form-group">
              <label>Telefoon</label>
              <input type="tel" v-model="venueForm.phone" />
            </div>
            <div class="form-group">
              <label>Website URL</label>
              <input type="url" v-model="venueForm.websiteUrl" placeholder="https://..." />
            </div>
            <!-- HOOFD FOTO -->
            <div class="form-group">
              <label class="section-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Hoofd Foto
                <span class="label-badge">Verplicht</span>
              </label>
              <p class="section-description">Deze foto wordt gebruikt als hoofdafbeelding voor je venue</p>
              <div class="photo-upload-container">
                <div v-if="venueForm.hoofdFotoPreview" class="photo-preview hoofd-foto-preview">
                  <img :src="venueForm.hoofdFotoPreview" alt="Hoofd foto preview" />
                  <div class="photo-badge">Hoofd Foto</div>
                  <button 
                    type="button" 
                    class="btn-remove-photo" 
                    @click="removeHoofdFoto"
                    title="Hoofd foto verwijderen"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div v-else-if="venueForm.existingHoofdFoto" class="photo-preview hoofd-foto-preview">
                  <img :src="venueForm.existingHoofdFoto" alt="Huidige hoofd foto" />
                  <div class="photo-badge">Hoofd Foto</div>
                  <button 
                    type="button" 
                    class="btn-remove-photo" 
                    @click="removeHoofdFoto"
                    title="Hoofd foto verwijderen"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <label class="file-upload-label" :class="{ 'has-photo': venueForm.hoofdFotoPreview || venueForm.existingHoofdFoto }">
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleHoofdFotoUpload"
                    class="file-input"
                    ref="hoofdFotoInput"
                  />
                  <span class="file-upload-text">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    {{ venueForm.hoofdFotoPreview || venueForm.existingHoofdFoto ? 'Hoofd foto wijzigen' : 'Hoofd foto uploaden' }}
                  </span>
                </label>
              </div>
              <p class="photo-hint">Maximaal 5MB. Ondersteunde formaten: JPG, PNG, GIF</p>
            </div>

            <!-- SFEERBEELDEN -->
            <div class="form-group">
              <label class="section-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Sfeerbeelden
                <span class="label-badge optional">Optioneel</span>
              </label>
              <p class="section-description">Upload meerdere foto's om de sfeer van je venue te tonen</p>
              
              <!-- Existing sfeerbeelden -->
              <div v-if="venueForm.existingSfeerbeelden && venueForm.existingSfeerbeelden.length > 0" class="sfeerbeelden-grid">
                <div 
                  v-for="(sfeerbeeld, index) in venueForm.existingSfeerbeelden" 
                  :key="index"
                  class="sfeerbeeld-preview"
                >
                  <img :src="sfeerbeeld.url" :alt="`Sfeerbeeld ${index + 1}`" />
                  <button 
                    type="button" 
                    class="btn-remove-sfeerbeeld" 
                    @click="removeSfeerbeeld(index)"
                    title="Sfeerbeeld verwijderen"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- New sfeerbeelden preview -->
              <div v-if="venueForm.newSfeerbeelden && venueForm.newSfeerbeelden.length > 0" class="sfeerbeelden-grid">
                <div 
                  v-for="(sfeerbeeld, index) in venueForm.newSfeerbeelden" 
                  :key="`new-${index}`"
                  class="sfeerbeeld-preview"
                >
                  <img :src="sfeerbeeld.preview" :alt="`Nieuw sfeerbeeld ${index + 1}`" />
                  <div class="photo-badge new">Nieuw</div>
                  <button 
                    type="button" 
                    class="btn-remove-sfeerbeeld" 
                    @click="removeNewSfeerbeeld(index)"
                    title="Sfeerbeeld verwijderen"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <label class="file-upload-label sfeerbeelden-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  @change="handleSfeerbeeldenUpload"
                  class="file-input"
                  ref="sfeerbeeldenInput"
                />
                <span class="file-upload-text">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Sfeerbeelden toevoegen
                </span>
              </label>
              <p class="photo-hint">Je kunt meerdere foto's tegelijk selecteren. Maximaal 5MB per foto.</p>
            </div>
            <button type="submit" class="btn-submit">Opslaan</button>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import { useAuth } from '@/composables/useAuth.js'
import { usersService } from '@/services/users.service.js'
import { roleRequestsService } from '@/services/rolerequests.service.js'
import { venuesService } from '@/services/venues.service.js'
import { geocodingService } from '@/services/geocoding.service.js'

const { isAuthenticated, user } = useAuth()

// User Info - leeg als niet ingelogd
const userInfo = ref({
  firstName: '',
  lastName: '',
  age: null,
  campusCity: '',
  gender: '',
  bio: '',
  role: ''
})

const loading = ref(false)
const showEditProfileModal = ref(false)
const savingProfile = ref(false)

// Edit Profile Form
const editProfileForm = ref({
  firstName: '',
  lastName: '',
  age: null,
  campusCity: '',
  gender: '',
  bio: ''
})

// Avatar Color Personalization - Load from localStorage or use default
const getStoredColor = () => {
  const stored = localStorage.getItem('avatarColor')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      return { value: '#9b5cff', dark: '#6d28d9' }
    }
  }
  return { value: '#9b5cff', dark: '#6d28d9' }
}

const storedColor = getStoredColor()
const avatarColor = ref(storedColor.value)
const avatarColorDark = ref(storedColor.dark)
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

const selectColor = async (color) => {
  avatarColor.value = color.value
  avatarColorDark.value = color.dark
  // Save to localStorage
  localStorage.setItem('avatarColor', JSON.stringify({ value: color.value, dark: color.dark }))
  
  // Save to database if logged in
  if (isAuthenticated.value && user.value?.UserID) {
    try {
      await usersService.update(user.value.UserID, {
        AvatarColor: color.value,
        AvatarColorDark: color.dark
      })
    } catch (error) {
      console.error('Error saving avatar color to database:', error)
      // Don't show error to user, localStorage is already saved
    }
  }
  
  showColorPicker.value = false
}

const userInitials = computed(() => {
  if (userInfo.value.firstName && userInfo.value.lastName) {
    return `${userInfo.value.firstName[0]}${userInfo.value.lastName[0]}`.toUpperCase()
  }
  return '??'
})

const isVenueOwner = computed(() => {
  const role = userInfo.value.role || user.value?.Role || ''
  return role === 'VenueOwner' || role === 'venue_owner'
})

const isAdmin = computed(() => {
  const role = userInfo.value.role || user.value?.Role || ''
  return role === 'Admin' || role === 'admin'
})

// Fetch user data from API
const fetchUserData = async () => {
  if (!isAuthenticated.value || !user.value?.UserID) {
    // Reset to empty if not logged in
    userInfo.value = {
      firstName: '',
      lastName: '',
      age: null,
      campusCity: '',
      gender: '',
      bio: '',
      role: ''
    }
    return
  }

  loading.value = true
  try {
    const userData = await usersService.getById(user.value.UserID)
    
    // Load avatar color from database if available
    if (userData.AvatarColor && userData.AvatarColorDark) {
      avatarColor.value = userData.AvatarColor
      avatarColorDark.value = userData.AvatarColorDark
      // Also update localStorage
      localStorage.setItem('avatarColor', JSON.stringify({ 
        value: userData.AvatarColor, 
        dark: userData.AvatarColorDark 
      }))
    }
    
    // Map API response to our userInfo format
    userInfo.value = {
      firstName: userData.FirstName || '',
      lastName: userData.LastName || '',
      age: userData.Age || null,
      campusCity: userData.CampusCity || '',
      gender: userData.Gender || '',
      bio: userData.Bio || '',
      role: userData.Role || 'User',
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Keep empty values on error
  } finally {
    loading.value = false
  }
}

// Watch for auth changes and fetch user data
watch([isAuthenticated, user], () => {
  fetchUserData()
}, { immediate: true })

// Watch for edit modal opening to populate form
watch(showEditProfileModal, (isOpen) => {
  if (isOpen && isAuthenticated.value) {
    // Populate form with current user data
    editProfileForm.value = {
      firstName: userInfo.value.firstName || '',
      lastName: userInfo.value.lastName || '',
      age: userInfo.value.age || null,
      campusCity: userInfo.value.campusCity || '',
      gender: userInfo.value.gender || '',
      bio: userInfo.value.bio || '',
    }
  }
})

// Save profile changes
const saveProfile = async () => {
  if (!isAuthenticated.value || !user.value?.UserID) {
    alert('Je moet ingelogd zijn om je profiel te bewerken')
    return
  }

  savingProfile.value = true
  try {
    const updateData = {
      FirstName: editProfileForm.value.firstName?.trim() || null,
      LastName: editProfileForm.value.lastName?.trim() || null,
      Age: editProfileForm.value.age || null,
      CampusCity: editProfileForm.value.campusCity?.trim() || null,
      Gender: editProfileForm.value.gender?.trim() || null,
      Bio: editProfileForm.value.bio?.trim() || null
    }

    await usersService.update(user.value.UserID, updateData)
    
    // Refresh user data
    await fetchUserData()
    
    // Close modal
    showEditProfileModal.value = false
    
    alert('Profiel succesvol bijgewerkt!')
  } catch (error) {
    console.error('Error updating profile:', error)
    const errorMessage = error.response?.data?.error || error.message || 'Er is een fout opgetreden bij het bijwerken van je profiel'
    alert(errorMessage)
  } finally {
    savingProfile.value = false
  }
}

// Check for pending role requests
const checkPendingRequest = async () => {
  if (!isAuthenticated.value || !user.value?.UserID) {
    hasPendingRequest.value = false
    return
  }

  try {
    const requests = await roleRequestsService.getAll({
      userId: user.value.UserID,
      status: 'pending'
    })
    hasPendingRequest.value = requests.length > 0
  } catch (error) {
    console.error('Error checking pending requests:', error)
  }
}

// Submit role request
const submitRoleRequest = async () => {
  if (!selectedRole.value) {
    roleRequestError.value = 'Selecteer een rol'
    return
  }

  roleRequestError.value = ''
  roleRequestSuccess.value = ''
  roleRequestLoading.value = true

  try {
    await roleRequestsService.create(selectedRole.value, roleRequestMessage.value)
    roleRequestSuccess.value = 'Je aanvraag is succesvol verzonden!'
    hasPendingRequest.value = true
    
    // Close modal after 2 seconds
    setTimeout(() => {
      showRoleRequestModal.value = false
      selectedRole.value = ''
      roleRequestMessage.value = ''
      roleRequestSuccess.value = ''
    }, 2000)
  } catch (error) {
    roleRequestError.value = error.response?.data?.error || error.message || 'Er is een fout opgetreden'
  } finally {
    roleRequestLoading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchUserData()
  checkPendingRequest()
  fetchUserVenues()
})

// Check for pending requests when auth changes
watch([isAuthenticated, user], () => {
  checkPendingRequest()
  fetchUserVenues()
})

// Modals
const showLogin = ref(false)
const showRegister = ref(false)
const showAddVenue = ref(false)
const showRoleRequestModal = ref(false)
const editingVenueIndex = ref(null)

// Role Request
const selectedRole = ref('')
const roleRequestMessage = ref('')
const roleRequestLoading = ref(false)
const roleRequestError = ref('')
const roleRequestSuccess = ref('')
const hasPendingRequest = ref(false)

// Forms removed - now handled in Login.vue and Register.vue components

const venueForm = ref({
  name: '',
  description: '',
  type: '',
  address: '',
  city: '',
  postalCode: '',
  lat: null,
  lng: null,
  maxCap: null,
  averagePrice: '',
  openingHours: '',
  email: '',
  phone: '',
  websiteUrl: '',
  // Hoofd foto
  hoofdFotoPreview: null, // Base64 preview of new hoofd foto
  existingHoofdFoto: null, // URL of existing hoofd foto from database
  hoofdFotoFile: null, // File object for upload
  existingHoofdFotoId: null, // ID of existing hoofd foto for update/delete
  // Sfeerbeelden
  existingSfeerbeelden: [], // Array of { id, url } for existing sfeerbeelden
  newSfeerbeelden: [], // Array of { file, preview } for new sfeerbeelden
  sfeerbeeldenToDelete: [] // Array of IDs to delete
})

// Opening hours per day
const daysOfWeek = [
  { key: 'maandag', label: 'Maandag' },
  { key: 'dinsdag', label: 'Dinsdag' },
  { key: 'woensdag', label: 'Woensdag' },
  { key: 'donderdag', label: 'Donderdag' },
  { key: 'vrijdag', label: 'Vrijdag' },
  { key: 'zaterdag', label: 'Zaterdag' },
  { key: 'zondag', label: 'Zondag' }
]

const openingHours = ref({
  maandag: { enabled: false, open: '09:00', close: '17:00' },
  dinsdag: { enabled: false, open: '09:00', close: '17:00' },
  woensdag: { enabled: false, open: '09:00', close: '17:00' },
  donderdag: { enabled: false, open: '09:00', close: '17:00' },
  vrijdag: { enabled: false, open: '09:00', close: '17:00' },
  zaterdag: { enabled: false, open: '09:00', close: '17:00' },
  zondag: { enabled: false, open: '09:00', close: '17:00' }
})

// Geocoding
const geocodingInProgress = ref(false)
const geocodingError = ref('')
let geocodingTimeout = null

// User Venues
const userVenues = ref([])
const loadingVenues = ref(false)

const handleLogin = (loginData) => {
  // User is already logged in via useAuth composable
  // Fetch user data after login
  fetchUserData()
  showLogin.value = false
}

const handleRegister = (registerData) => {
  // After registration, user should login
  // For now, just close the modal
  showRegister.value = false
}

const handleLogout = () => {
  const { logout } = useAuth()
  logout()
  fetchUserData() // Reset user info
}

// Fetch user venues
const fetchUserVenues = async () => {
  if (!isAuthenticated.value || (!isVenueOwner.value && !isAdmin.value)) {
    userVenues.value = []
    return
  }

  loadingVenues.value = true
  try {
    // Get all venues and filter by owner
    const allVenues = await venuesService.getAll()
    const userId = user.value?.UserID
    
    // Filter venues by owner
    userVenues.value = allVenues
      .filter(venue => venue.OwnerID === userId)
      .map(venue => ({
        id: venue.VenueID,
        name: venue.Name,
        description: venue.Description || '',
        type: venue.venuetype?.VenueType || '',
        address: venue.venueaddress?.[0]?.Address || '',
        city: venue.venueaddress?.[0]?.City || '',
        postalCode: venue.venueaddress?.[0]?.PostalCode || '',
        maxCap: venue.MaxCap || null,
        averagePrice: venue.AveragePrice || '',
        VenueID: venue.VenueID
      }))
  } catch (error) {
    console.error('Error fetching user venues:', error)
  } finally {
    loadingVenues.value = false
  }
}

// Watch address fields for geocoding
watch([() => venueForm.value.address, () => venueForm.value.city, () => venueForm.value.postalCode], () => {
  if (geocodingTimeout) {
    clearTimeout(geocodingTimeout)
  }
  
  // Debounce geocoding - wait 1.5 seconds after user stops typing
  geocodingTimeout = setTimeout(async () => {
    // Only geocode if we have both address and city, and lat/lng are not already set
    if (venueForm.value.address && venueForm.value.city && !venueForm.value.lat && !venueForm.value.lng) {
      await geocodeAddress()
    }
  }, 1500)
})

// Geocode address
const geocodeAddress = async () => {
  // Validate required fields
  if (!venueForm.value.address || !venueForm.value.city) {
    geocodingError.value = 'Adres en stad zijn verplicht voor geocoding'
    return
  }
  
  // Check if address is valid (at least 5 characters)
  if (venueForm.value.address.trim().length < 5) {
    geocodingError.value = 'Adres is te kort'
    return
  }
  
  geocodingInProgress.value = true
  geocodingError.value = ''
  
  try {
    const result = await geocodingService.geocodeAddress(
      venueForm.value.address.trim(),
      venueForm.value.city.trim(),
      venueForm.value.postalCode?.trim() || ''
    )
    
    if (result && result.lat && result.lng) {
      venueForm.value.lat = result.lat
      venueForm.value.lng = result.lng
      geocodingError.value = '' // Clear any previous errors
    } else {
      geocodingError.value = `Kon coördinaten niet vinden voor "${venueForm.value.address}, ${venueForm.value.city}". Controleer het adres en probeer het opnieuw.`
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    geocodingError.value = 'Fout bij ophalen van coördinaten. Probeer het later opnieuw.'
  } finally {
    geocodingInProgress.value = false
  }
}

// Manual geocode button (optional - can be added to UI)
const manualGeocode = async () => {
  await geocodeAddress()
}

// Load example data for testing
const loadExampleData = () => {
  venueForm.value = {
    name: 'Voorbeeld Bar',
    description: 'Een leuke bar in het centrum van Amsterdam',
    type: 'Bar',
    address: 'Kerkstraat 123',
    city: 'Amsterdam',
    postalCode: '1017 AB',
    lat: 52.3676,
    lng: 4.9041,
    maxCap: 100,
    averagePrice: '€10-€20',
    openingHours: '',
    email: 'info@voorbeeldbar.nl',
    phone: '+31 20 1234567',
    websiteUrl: 'https://voorbeeldbar.nl'
  }
  
  // Set example opening hours
  daysOfWeek.forEach(day => {
    openingHours.value[day.key] = {
      enabled: true,
      open: day.key === 'zaterdag' || day.key === 'zondag' ? '13:00' : '09:00',
      close: day.key === 'zaterdag' ? '22:00' : day.key === 'zondag' ? '20:00' : '21:00'
    }
  })
  
  // Auto-geocode the address
  setTimeout(() => {
    geocodeAddress()
  }, 500)
}

// Copy time to all days
const copyTimeToAll = (sourceDay) => {
  const source = openingHours.value[sourceDay]
  daysOfWeek.forEach(day => {
    if (openingHours.value[day.key].enabled) {
      openingHours.value[day.key].open = source.open
      openingHours.value[day.key].close = source.close
    }
  })
}

// Convert opening hours to JSON format
const getOpeningHoursJSON = () => {
  const hours = {}
  daysOfWeek.forEach(day => {
    const dayData = openingHours.value[day.key]
    if (dayData.enabled && dayData.open && dayData.close) {
      hours[day.key] = `${dayData.open}-${dayData.close}`
    }
  })
  return Object.keys(hours).length > 0 ? hours : null
}

// Load opening hours from JSON
const loadOpeningHours = (jsonData) => {
  if (!jsonData) {
    return
  }
  
  try {
    const hours = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    daysOfWeek.forEach(day => {
      if (hours[day.key]) {
        const timeRange = hours[day.key].split('-')
        if (timeRange.length === 2) {
          openingHours.value[day.key] = {
            enabled: true,
            open: timeRange[0].trim(),
            close: timeRange[1].trim()
          }
        }
      }
    })
  } catch (e) {
    console.error('Error parsing opening hours:', e)
  }
}

const editVenue = async (index) => {
  editingVenueIndex.value = index
  const venue = userVenues.value[index]
  
  // Fetch full venue data if we have VenueID
  if (venue.VenueID) {
    try {
      const fullVenue = await venuesService.getById(venue.VenueID)
      const address = fullVenue.venueaddress?.[0]
      const contact = fullVenue.venuecontact?.[0]
      
      // Load existing hoofd foto (IsHoofdFoto = true or first foto)
      let existingHoofdFotoUrl = null
      let existingHoofdFotoId = null
      const hoofdFoto = fullVenue.venuefoto?.find(f => f.IsHoofdFoto === true) || fullVenue.venuefoto?.[0]
      if (hoofdFoto && hoofdFoto.Foto) {
        // Convert Buffer/ArrayBuffer to base64 using helper function
        const base64 = arrayBufferToBase64(hoofdFoto.Foto)
        if (base64) {
          let mimeType = 'image/png'
          const firstChars = base64.substring(0, 20)
          if (firstChars.includes('/9j/')) {
            mimeType = 'image/jpeg'
          } else if (firstChars.includes('iVBORw0KGgo')) {
            mimeType = 'image/png'
          }
          existingHoofdFotoUrl = `data:${mimeType};base64,${base64}`
          existingHoofdFotoId = hoofdFoto.VenueFotoID
        }
      }
      
      // Load existing sfeerbeelden
      const existingSfeerbeelden = []
      if (fullVenue.venuesfeerbeeld && fullVenue.venuesfeerbeeld.length > 0) {
        fullVenue.venuesfeerbeeld.forEach(sfeerbeeld => {
          if (sfeerbeeld.Foto) {
            const base64 = arrayBufferToBase64(sfeerbeeld.Foto)
            if (base64) {
              let mimeType = 'image/png'
              const firstChars = base64.substring(0, 20)
              if (firstChars.includes('/9j/')) {
                mimeType = 'image/jpeg'
              } else if (firstChars.includes('iVBORw0KGgo')) {
                mimeType = 'image/png'
              }
              existingSfeerbeelden.push({
                id: sfeerbeeld.SfeerbeeldID,
                url: `data:${mimeType};base64,${base64}`
              })
            }
          }
        })
      }
      
      venueForm.value = {
        name: fullVenue.Name || '',
        description: fullVenue.Description || '',
        type: fullVenue.venuetype?.VenueType || '',
        address: address?.Address || '',
        city: address?.City || '',
        postalCode: address?.PostalCode || '',
        lat: address?.Lat ? parseFloat(address.Lat) : null,
        lng: address?.Lng ? parseFloat(address.Lng) : null,
        maxCap: fullVenue.MaxCap || null,
        averagePrice: fullVenue.AveragePrice || '',
        openingHours: '', // Will be loaded separately
        email: contact?.Email || '',
        phone: contact?.Phone || '',
        websiteUrl: contact?.WebsiteURL || '',
        // Hoofd foto
        hoofdFotoPreview: null,
        existingHoofdFoto: existingHoofdFotoUrl,
        hoofdFotoFile: null,
        existingHoofdFotoId: existingHoofdFotoId,
        // Sfeerbeelden
        existingSfeerbeelden: existingSfeerbeelden,
        newSfeerbeelden: [],
        sfeerbeeldenToDelete: []
      }
      
      // Load opening hours
      if (fullVenue.OpeningHours) {
        loadOpeningHours(fullVenue.OpeningHours)
      }
    } catch (error) {
      console.error('Error fetching venue details:', error)
      // Fallback to basic data
      venueForm.value = {
        name: venue.name || '',
        description: venue.description || '',
        type: venue.type || '',
        address: venue.address || '',
        city: venue.city || '',
        postalCode: '',
        lat: null,
        lng: null,
        maxCap: venue.maxCap || null,
        averagePrice: '',
        openingHours: '',
        email: '',
        phone: '',
        websiteUrl: ''
      }
      // Reset opening hours
      daysOfWeek.forEach(day => {
        openingHours.value[day.key] = {
          enabled: false,
          open: '09:00',
          close: '17:00'
        }
      })
    }
  } else {
    venueForm.value = {
      name: venue.name || '',
      description: venue.description || '',
      type: venue.type || '',
      address: venue.address || '',
      city: venue.city || '',
      postalCode: '',
      lat: null,
      lng: null,
      maxCap: venue.maxCap || null,
      averagePrice: '',
      openingHours: '',
      email: '',
      phone: '',
      websiteUrl: ''
    }
    // Reset opening hours
    daysOfWeek.forEach(day => {
      openingHours.value[day.key] = {
        enabled: false,
        open: '09:00',
        close: '17:00'
      }
    })
  }
}

const saveVenue = async () => {
  if (!isAuthenticated.value) return

  try {
    const venueData = {
      Name: venueForm.value.name?.trim(),
      Description: venueForm.value.description?.trim() || null,
      MaxCap: venueForm.value.maxCap ? parseInt(venueForm.value.maxCap) : null,
      AveragePrice: venueForm.value.averagePrice?.trim() || null
    }

    // Validate required fields
    if (!venueData.Name || venueData.Name.length === 0) {
      alert('Venue naam is verplicht')
      return
    }

    // Convert opening hours to JSON
    const openingHoursJSON = getOpeningHoursJSON()
    if (openingHoursJSON) {
      venueData.OpeningHours = openingHoursJSON
    }

    // For venue type
    if (venueForm.value.type) {
      venueData.VenueType = venueForm.value.type
    }

    // Prepare address fields (will be used for both create and update)
    const addressFields = {}
    if (venueForm.value.address?.trim()) {
      addressFields.Address = venueForm.value.address.trim()
    }
    if (venueForm.value.city?.trim()) {
      addressFields.City = venueForm.value.city.trim()
    }
    if (venueForm.value.postalCode?.trim()) {
      addressFields.PostalCode = venueForm.value.postalCode.trim()
    }
    if (venueForm.value.lat !== null && venueForm.value.lat !== undefined && venueForm.value.lat !== '') {
      const latNum = parseFloat(venueForm.value.lat)
      if (!isNaN(latNum)) {
        addressFields.Lat = latNum
      }
    }
    if (venueForm.value.lng !== null && venueForm.value.lng !== undefined && venueForm.value.lng !== '') {
      const lngNum = parseFloat(venueForm.value.lng)
      if (!isNaN(lngNum)) {
        addressFields.Lng = lngNum
      }
    }

    // Prepare contact fields (will be used for both create and update)
    const contactFields = {}
    if (venueForm.value.email?.trim()) {
      contactFields.Email = venueForm.value.email.trim()
    }
    if (venueForm.value.phone?.trim()) {
      contactFields.Phone = venueForm.value.phone.trim()
    }
    if (venueForm.value.websiteUrl?.trim()) {
      contactFields.WebsiteURL = venueForm.value.websiteUrl.trim()
    }

    if (editingVenueIndex.value !== null) {
      // Update existing venue
      const venueId = userVenues.value[editingVenueIndex.value].VenueID
      
      // Update base venue
      await venuesService.update(venueId, venueData)
      
      // Update or create address
      if (Object.keys(addressFields).length > 0) {
        try {
          // Check if address exists
          const existingAddresses = await venuesService.getAddresses(venueId)
          if (existingAddresses && existingAddresses.length > 0) {
            // Update existing address
            await venuesService.updateAddress(venueId, existingAddresses[0].VenueAddressID, addressFields)
          } else {
            // Create new address
            await venuesService.createAddress(venueId, addressFields)
          }
        } catch (error) {
          console.error('Error updating address:', error)
        }
      }
      
      // Update or create contact
      if (Object.keys(contactFields).length > 0) {
        try {
          // Check if contact exists
          const existingContacts = await venuesService.getContacts(venueId)
          if (existingContacts && existingContacts.length > 0) {
            // Update existing contact
            await venuesService.updateContact(venueId, existingContacts[0].VenueContactID, contactFields)
          } else {
            // Create new contact
            await venuesService.createContact(venueId, contactFields)
          }
        } catch (error) {
          console.error('Error updating contact:', error)
        }
      }
      
      // Handle hoofd foto upload/update
      if (venueForm.value.hoofdFotoFile) {
        try {
          console.log('📸 Uploading hoofd foto...')
          // Convert file to base64
          const base64Photo = await fileToBase64(venueForm.value.hoofdFotoFile)
          console.log('✅ Base64 conversion successful, length:', base64Photo?.length)
          
          if (!base64Photo) {
            throw new Error('Base64 conversie mislukt')
          }
          
          // Check if hoofd foto already exists
          if (venueForm.value.existingHoofdFotoId) {
            console.log('🔄 Updating existing hoofd foto:', venueForm.value.existingHoofdFotoId)
            // Update existing hoofd foto and set IsHoofdFoto = true
            await venuesService.updateFoto(venueId, venueForm.value.existingHoofdFotoId, {
              Foto: base64Photo,
              IsHoofdFoto: true
            })
            console.log('✅ Hoofd foto updated successfully')
          } else {
            console.log('➕ Creating new hoofd foto')
            // First, unset any existing hoofd foto
            const existingFotos = await venuesService.getFotos(venueId)
            if (existingFotos && existingFotos.length > 0) {
              console.log('🔄 Unsetting existing fotos as hoofd foto')
              // Update all existing fotos to IsHoofdFoto = false
              for (const foto of existingFotos) {
                await venuesService.updateFoto(venueId, foto.VenueFotoID, {
                  IsHoofdFoto: false
                })
              }
            }
            // Create new hoofd foto with IsHoofdFoto = true
            await venuesService.createFoto(venueId, {
              Foto: base64Photo,
              IsHoofdFoto: true
            })
            console.log('✅ New hoofd foto created successfully')
          }
        } catch (error) {
          console.error('❌ Error uploading hoofd foto:', error)
          console.error('Error details:', error.response?.data || error.message)
          alert('Er is een fout opgetreden bij het uploaden van de hoofd foto: ' + (error.response?.data?.error || error.message || 'Onbekende fout'))
        }
      } else if (!venueForm.value.hoofdFotoFile && !venueForm.value.hoofdFotoPreview && !venueForm.value.existingHoofdFoto && venueForm.value.existingHoofdFotoId) {
        // User removed hoofd foto - delete existing hoofd foto if any
        // This happens when user had a photo, removed it, and didn't upload a new one
        try {
          await venuesService.deleteFoto(venueId, venueForm.value.existingHoofdFotoId)
        } catch (error) {
          console.error('Error deleting hoofd foto:', error)
        }
      }
      
      // Handle sfeerbeelden deletions
      if (venueForm.value.sfeerbeeldenToDelete && venueForm.value.sfeerbeeldenToDelete.length > 0) {
        for (const sfeerbeeldId of venueForm.value.sfeerbeeldenToDelete) {
          try {
            await venuesService.deleteSfeerbeeld(venueId, sfeerbeeldId)
          } catch (error) {
            console.error('Error deleting sfeerbeeld:', error)
          }
        }
      }
      
      // Handle new sfeerbeelden upload
      if (venueForm.value.newSfeerbeelden && venueForm.value.newSfeerbeelden.length > 0) {
        for (const sfeerbeeld of venueForm.value.newSfeerbeelden) {
          try {
            const base64Photo = await fileToBase64(sfeerbeeld.file)
            await venuesService.createSfeerbeeld(venueId, {
              Foto: base64Photo
            })
          } catch (error) {
            console.error('Error uploading sfeerbeeld:', error)
          }
        }
      }
    } else {
      // Create new venue - backend will use authenticated user as owner
      // First create the base venue
      const createdVenue = await venuesService.create(venueData)
      const venueId = createdVenue.VenueID
      
      // Then create address separately if we have address data
      if (Object.keys(addressFields).length > 0) {
        try {
          await venuesService.createAddress(venueId, addressFields)
        } catch (error) {
          console.error('Error creating address:', error)
          // Don't fail the whole operation if address creation fails
        }
      }
      
      // Then create contact separately if we have contact data
      if (Object.keys(contactFields).length > 0) {
        try {
          await venuesService.createContact(venueId, contactFields)
        } catch (error) {
          console.error('Error creating contact:', error)
          // Don't fail the whole operation if contact creation fails
        }
      }
      
      // Handle hoofd foto upload
      if (venueForm.value.hoofdFotoFile) {
        try {
          console.log('📸 Uploading hoofd foto for new venue...')
          // Convert file to base64
          const base64Photo = await fileToBase64(venueForm.value.hoofdFotoFile)
          console.log('✅ Base64 conversion successful, length:', base64Photo?.length)
          
          if (!base64Photo) {
            throw new Error('Base64 conversie mislukt')
          }
          
          // Create new hoofd foto with IsHoofdFoto = true
          await venuesService.createFoto(venueId, {
            Foto: base64Photo,
            IsHoofdFoto: true
          })
          console.log('✅ Hoofd foto created successfully')
        } catch (error) {
          console.error('❌ Error uploading hoofd foto:', error)
          console.error('Error details:', error.response?.data || error.message)
          alert('Er is een fout opgetreden bij het uploaden van de hoofd foto: ' + (error.response?.data?.error || error.message || 'Onbekende fout'))
        }
      }
      
      // Handle new sfeerbeelden upload
      if (venueForm.value.newSfeerbeelden && venueForm.value.newSfeerbeelden.length > 0) {
        console.log('📸 Uploading', venueForm.value.newSfeerbeelden.length, 'sfeerbeelden for new venue...')
        for (const sfeerbeeld of venueForm.value.newSfeerbeelden) {
          try {
            const base64Photo = await fileToBase64(sfeerbeeld.file)
            if (!base64Photo) {
              throw new Error('Base64 conversie mislukt voor sfeerbeeld')
            }
            await venuesService.createSfeerbeeld(venueId, {
              Foto: base64Photo
            })
            console.log('✅ Sfeerbeeld uploaded successfully')
          } catch (error) {
            console.error('❌ Error uploading sfeerbeeld:', error)
            console.error('Error details:', error.response?.data || error.message)
            alert('Er is een fout opgetreden bij het uploaden van een sfeerbeeld: ' + (error.response?.data?.error || error.message || 'Onbekende fout'))
          }
        }
      }
    }
    
    await fetchUserVenues() // Refresh list
    closeVenueModal()
  } catch (error) {
    console.error('Error saving venue:', error)
    const errorMessage = error.response?.data?.error || error.message || 'Er is een fout opgetreden bij het opslaan van het venue'
    
    // Check if it's a duplicate name error
    if (errorMessage.toLowerCase().includes('unique') || 
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('already exists')) {
      alert('Er bestaat al een venue met deze naam. Kies een andere naam.')
    } else {
      alert(errorMessage)
    }
  }
}

// Handle hoofd foto upload
const handleHoofdFotoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Alleen afbeeldingen zijn toegestaan')
    return
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('Bestand is te groot. Maximum 5MB toegestaan.')
    return
  }
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    venueForm.value.hoofdFotoPreview = e.target.result
    venueForm.value.hoofdFotoFile = file
    // Clear existing photo when new one is uploaded
    venueForm.value.existingHoofdFoto = null
  }
  reader.readAsDataURL(file)
}

// Remove hoofd foto
const removeHoofdFoto = () => {
  venueForm.value.hoofdFotoPreview = null
  venueForm.value.existingHoofdFoto = null
  venueForm.value.hoofdFotoFile = null
  venueForm.value.existingHoofdFotoId = null
  // Reset file input
  if (venueForm.value.$refs?.hoofdFotoInput) {
    venueForm.value.$refs.hoofdFotoInput.value = ''
  }
}

// Handle sfeerbeelden upload (multiple files)
const handleSfeerbeeldenUpload = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return
  
  files.forEach(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is geen geldige afbeelding`)
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is te groot. Maximum 5MB toegestaan.`)
      return
    }
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      venueForm.value.newSfeerbeelden.push({
        file: file,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
  
  // Reset file input to allow selecting same files again
  event.target.value = ''
}

// Remove existing sfeerbeeld
const removeSfeerbeeld = (index) => {
  const sfeerbeeld = venueForm.value.existingSfeerbeelden[index]
  if (sfeerbeeld && sfeerbeeld.id) {
    venueForm.value.sfeerbeeldenToDelete.push(sfeerbeeld.id)
  }
  venueForm.value.existingSfeerbeelden.splice(index, 1)
}

// Remove new sfeerbeeld (not yet saved)
const removeNewSfeerbeeld = (index) => {
  venueForm.value.newSfeerbeelden.splice(index, 1)
}

// Helper function to convert ArrayBuffer/Buffer to base64 (same as ClubList)
const arrayBufferToBase64 = (buffer) => {
  if (!buffer) {
    console.warn('arrayBufferToBase64: buffer is null or undefined')
    return null
  }
  
  // If it's already a string (base64), return it
  if (typeof buffer === 'string') {
    // Check if it's already a data URL
    if (buffer.startsWith('data:')) {
      return buffer.split(',')[1] // Extract base64 part
    }
    return buffer
  }
  
  try {
    let arrayBuffer = null
    
    // Check for Prisma Buffer format: { type: 'Buffer', data: [array] }
    if (buffer.type === 'Buffer' && Array.isArray(buffer.data)) {
      arrayBuffer = buffer.data
    }
    // Check for .data property (alternative Prisma format)
    else if (buffer.data && Array.isArray(buffer.data)) {
      arrayBuffer = buffer.data
    }
    // Direct array
    else if (Array.isArray(buffer)) {
      arrayBuffer = buffer
    }
    // ArrayBuffer
    else if (buffer instanceof ArrayBuffer) {
      arrayBuffer = new Uint8Array(buffer)
    }
    // Uint8Array
    else if (buffer instanceof Uint8Array) {
      arrayBuffer = buffer
    }
    // Handle object with numeric keys (like {0: 255, 1: 216, ...})
    else if (typeof buffer === 'object' && !Array.isArray(buffer) && buffer.constructor === Object) {
      const keys = Object.keys(buffer)
      const numericKeys = keys.filter(k => !isNaN(parseInt(k)))
      
      if (numericKeys.length > 0) {
        const maxIndex = Math.max(...numericKeys.map(k => parseInt(k)))
        arrayBuffer = []
        for (let i = 0; i <= maxIndex; i++) {
          if (buffer[i] !== undefined) {
            arrayBuffer[i] = buffer[i]
          }
        }
      } else {
        console.warn('Object has no numeric keys, cannot convert')
        return null
      }
    }
    // Try to access .data if it exists
    else if (buffer.data) {
      arrayBuffer = buffer.data
    }
    else {
      console.warn('Unknown buffer format, attempting direct conversion')
      try {
        arrayBuffer = new Uint8Array(buffer)
      } catch (e) {
        console.error('Failed to create Uint8Array from buffer:', e)
        return null
      }
    }
    
    // Convert to base64
    if (arrayBuffer) {
      const uint8Array = arrayBuffer instanceof Uint8Array 
        ? arrayBuffer 
        : new Uint8Array(arrayBuffer)
      
      const base64 = btoa(
        uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      return base64
    } else {
      console.warn('arrayBuffer is null after processing')
      return null
    }
  } catch (error) {
    console.error('Error converting buffer to base64:', error)
    return null
  }
}

// Convert file to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Remove data:image/...;base64, prefix
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
        postalCode: '',
        lat: null,
        lng: null,
        maxCap: null,
        averagePrice: '',
        openingHours: '',
        email: '',
        phone: '',
        websiteUrl: '',
        photoPreview: null,
        existingPhoto: null,
        photoFile: null
      }
  
  // Reset opening hours
  daysOfWeek.forEach(day => {
    openingHours.value[day.key] = {
      enabled: false,
      open: '09:00',
      close: '17:00'
    }
  })
  
  geocodingError.value = ''
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.role-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-edit-profile-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-profile-small:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-apply-role {
  padding: 6px 12px;
  background: rgba(155, 92, 255, 0.1);
  border: 1px solid #9b5cff;
  border-radius: 6px;
  color: #9b5cff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-apply-role:hover:not(:disabled) {
  background: rgba(155, 92, 255, 0.2);
  transform: translateY(-1px);
}

.btn-apply-role:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(155, 92, 255, 0.05);
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
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

.logout-button {
  width: 100%;
}

.btn-logout {
  width: 100%;
  padding: 12px 24px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
}

/* VENUE REGISTRATION */
.venue-registration-section {
  width: 100%;
  max-width: 600px;
}

.owned-venues-section {
  margin-top: 32px;
  width: 100%;
  max-width: 600px;
}

.add-venue-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 600px;
}

.btn-add-venue-large {
  padding: 16px 32px;
  background: rgba(155, 92, 255, 0.1);
  border: 2px dashed #9b5cff;
  border-radius: 12px;
  color: #9b5cff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.btn-add-venue-large:hover {
  background: rgba(155, 92, 255, 0.2);
  border-color: #8a4de6;
  transform: translateY(-2px);
}

.venue-location {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Opening Hours */
.opening-hours-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
  border-radius: 8px;
}

.opening-hour-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.day-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.day-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #9b5cff;
}

.day-label label {
  color: #eaeaea;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.time-input {
  padding: 8px 12px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 6px;
  color: #eaeaea;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.time-input:focus {
  border-color: #9b5cff;
  box-shadow: 0 0 0 2px rgba(155, 92, 255, 0.1);
}

.time-separator {
  color: #999;
  font-size: 14px;
}

.btn-copy-time {
  padding: 6px 8px;
  background: rgba(155, 92, 255, 0.1);
  border: 1px solid rgba(155, 92, 255, 0.3);
  border-radius: 6px;
  color: #9b5cff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-copy-time:hover {
  background: rgba(155, 92, 255, 0.2);
  border-color: rgba(155, 92, 255, 0.5);
}

.closed-label {
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.geocoding-status {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #3b82f6;
  font-size: 12px;
  margin-top: 8px;
}

.geocoding-error {
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
}

.required {
  color: #ef4444;
}

.btn-geocode {
  padding: 10px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.btn-geocode:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.btn-geocode:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-example {
  padding: 8px 16px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 12px;
}

.btn-example:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
}

.required {
  color: #ef4444;
}

.btn-geocode {
  padding: 10px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.btn-geocode:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.btn-geocode:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  font-style: italic;
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

/* VENUE MODAL */
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 12px 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(31, 31, 31, 0.95);
  border-color: #2a2a2a;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  padding: 12px 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(31, 31, 31, 0.95);
  border-color: #2a2a2a;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.btn-submit {
  padding: 12px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
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

/* Photo Upload Styles */
.photo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-photo {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #2a2a2a;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-remove-photo:hover {
  background: rgba(220, 38, 38, 0.9);
  border-color: #dc2626;
  transform: scale(1.1);
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 2px dashed #1f1f1f;
  border-radius: 10px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: fit-content;
}

.file-upload-label:hover {
  background: rgba(31, 31, 31, 0.95);
  border-color: #9b5cff;
  color: #9b5cff;
}

.file-upload-label.has-photo {
  border-color: #9b5cff;
  background: rgba(155, 92, 255, 0.1);
}

.file-upload-label svg {
  width: 20px;
  height: 20px;
}

.file-input {
  display: none;
}

.file-upload-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Section Labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #9b5cff;
  margin-bottom: 8px;
}

.label-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(155, 92, 255, 0.2);
  color: #9b5cff;
  border: 1px solid rgba(155, 92, 255, 0.3);
}

.label-badge.optional {
  background: rgba(100, 100, 100, 0.2);
  color: #999;
  border-color: rgba(100, 100, 100, 0.3);
}

.section-description {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

/* Hoofd Foto Preview */
.hoofd-foto-preview {
  border: 2px solid #9b5cff;
  box-shadow: 0 0 0 3px rgba(155, 92, 255, 0.1);
}

.photo-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  background: rgba(155, 92, 255, 0.9);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  z-index: 1;
}

.photo-badge.new {
  background: rgba(16, 185, 129, 0.9);
}

/* Sfeerbeelden Grid */
.sfeerbeelden-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.sfeerbeeld-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
}

.sfeerbeeld-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-sfeerbeeld {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #2a2a2a;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.btn-remove-sfeerbeeld:hover {
  background: rgba(220, 38, 38, 0.9);
  border-color: #dc2626;
  transform: scale(1.1);
}

.btn-remove-sfeerbeeld svg {
  width: 20px;
  height: 20px;
}

.sfeerbeelden-upload {
  margin-top: 8px;
}
</style>
