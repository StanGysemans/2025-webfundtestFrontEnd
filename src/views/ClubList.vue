<template>
  <main class="content">
    <div class="clublist-layout">
      <!-- LEFT SIDE: Search and Filters -->
      <aside class="left-sidebar">
        <!-- SEARCH BAR -->
        <section class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Zoek naar venues..." 
              v-model="searchQuery"
            />
            <button class="search-button" @click="applyFilters">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </section>

        <!-- FILTERS -->
        <section class="filters-section">
          <h2>Filters</h2>
          
          <!-- Open/Closed Filter -->
          <div class="filter-card">
            <h3>Openingsstatus</h3>
            <div class="filter-options">
              <label class="filter-option">
                <input 
                  type="radio" 
                  name="openStatus" 
                  value="all" 
                  v-model="filters.openStatus"
                />
                <span>Alle</span>
              </label>
              <label class="filter-option">
                <input 
                  type="radio" 
                  name="openStatus" 
                  value="open" 
                  v-model="filters.openStatus"
                />
                <span>Open</span>
              </label>
              <label class="filter-option">
                <input 
                  type="radio" 
                  name="openStatus" 
                  value="closed" 
                  v-model="filters.openStatus"
                />
                <span>Gesloten</span>
              </label>
            </div>
          </div>

          <!-- Venue Type Filter -->
          <div class="filter-card">
            <h3>Type Venue</h3>
            <div class="filter-options">
              <label class="filter-option">
                <input 
                  type="checkbox" 
                  value="club" 
                  v-model="filters.venueTypes"
                />
                <span>Club</span>
              </label>
              <label class="filter-option">
                <input 
                  type="checkbox" 
                  value="bar" 
                  v-model="filters.venueTypes"
                />
                <span>Bar</span>
              </label>
              <label class="filter-option">
                <input 
                  type="checkbox" 
                  value="restaurant" 
                  v-model="filters.venueTypes"
                />
                <span>Restaurant</span>
              </label>
              <label class="filter-option">
                <input 
                  type="checkbox" 
                  value="cafe" 
                  v-model="filters.venueTypes"
                />
                <span>Café</span>
              </label>
              <label class="filter-option">
                <input 
                  type="checkbox" 
                  value="event" 
                  v-model="filters.venueTypes"
                />
                <span>Evenement</span>
              </label>
            </div>
          </div>

          <!-- Crowd Level Filter -->
          <div class="filter-card">
            <h3>Bezetting (%)</h3>
            <div class="slider-filter-container">
              <!-- Min Slider -->
              <div class="slider-item">
                <label class="slider-label">
                  <span>Minimum:</span>
                  <span class="slider-value">{{ filters.crowdLevelMin }}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model.number="filters.crowdLevelMin"
                  class="range-slider"
                  @input="updateCrowdLevelFilter"
                />
              </div>
              
              <!-- Max Slider -->
              <div class="slider-item">
                <label class="slider-label">
                  <span>Maximum:</span>
                  <span class="slider-value">{{ filters.crowdLevelMax }}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model.number="filters.crowdLevelMax"
                  class="range-slider"
                  @input="updateCrowdLevelFilter"
                />
              </div>
              
              <div class="slider-info">
                <span v-if="filters.crowdLevelMin === 0 && filters.crowdLevelMax === 100">Alle bezettingsniveaus</span>
                <span v-else>{{ filters.crowdLevelMin }}% - {{ filters.crowdLevelMax }}% bezet</span>
              </div>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="filter-actions">
            <button class="btn-reset" @click="resetFilters">Resetten</button>
            <button class="btn-apply" @click="applyFilters">Toepassen</button>
          </div>
        </section>
      </aside>

      <!-- RIGHT SIDE: Venues List -->
      <section class="venues-list">
        <div class="venues-header">
          <h2>Venues</h2>
          <p class="venues-count">{{ filteredVenues.length }} venues gevonden</p>
        </div>

        <div class="venues-container">
          <div v-if="loading" class="loading-state">
            <p>Venues laden...</p>
          </div>
          <div 
            v-for="venue in filteredVenues" 
            :key="venue.id || venue.VenueID" 
            class="venue-card"
            @click="openVenueDetail(venue)"
          >
            <div class="venue-content">
              <!-- Venue Photo -->
              <div class="venue-photo">
                <img v-if="venue.image" :src="venue.image" :alt="venue.name" @error="handleImageError" />
                <div v-else class="no-photo-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Geen foto</span>
                </div>
              </div>
              
              <div class="venue-info">
                <div class="venue-header">
                  <h3>{{ venue.name }}</h3>
                  <span class="venue-status" :class="venue.currentlyOpen ? 'open' : 'closed'">
                    <span class="status-icon">{{ venue.currentlyOpen ? '🟢' : '🔴' }}</span>
                    {{ venue.currentlyOpen ? 'Open' : 'Gesloten' }}
                  </span>
                </div>
                
                <p class="venue-type">{{ venue.type }}</p>
                <p class="venue-description">{{ venue.description }}</p>
                
                <div class="venue-details">
                  <div class="venue-detail venue-address">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div class="address-text">
                      <span class="address-street">{{ venue.fullAddress }}</span>
                      <span class="address-city">{{ venue.city }}</span>
                    </div>
                  </div>
                  <div class="venue-detail venue-hours">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div class="opening-hours-text" v-html="venue.formattedHours"></div>
                  </div>
                  <div class="venue-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span v-if="venue.crowdLevelPercentage !== null && venue.crowdLevelPercentage !== undefined && venue.crowdLevelPercentage >= 0">
                      {{ venue.crowdLevelPercentage }}% vol
                    </span>
                    <span v-else>Onbekend</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredVenues.length === 0" class="empty-state">
            <p>Geen venues gevonden</p>
            <p class="empty-subtitle">Probeer andere filters of zoektermen</p>
          </div>
        </div>
      </section>
    </div>

    <!-- VENUE DETAIL MODAL -->
    <div v-if="selectedVenue" class="modal-overlay" @click.self="closeVenueDetail">
      <div class="venue-detail-modal">
        <div class="id-card">
          <div class="id-card-header">
            <h2>{{ selectedVenue.name }}</h2>
            <button class="modal-close" @click="closeVenueDetail">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="id-card-body">
            <div class="id-photo-section">
              <div 
                v-if="selectedVenue.hoofdFoto" 
                class="id-photo venue-photo-large"
              >
                <img :src="selectedVenue.hoofdFoto" :alt="selectedVenue.name" />
              </div>
              <div 
                v-else
                class="id-photo venue-photo-large"
                style="background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);"
              >
                <span class="id-initials">{{ selectedVenue.name.charAt(0) }}</span>
              </div>
            </div>
            
            <div class="id-info">
              <div class="id-field">
                <span class="id-label">Naam</span>
                <span class="id-value">{{ selectedVenue.name }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Type</span>
                <span class="id-value">{{ selectedVenue.type }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Beschrijving</span>
                <span class="id-value">{{ selectedVenue.description || 'Geen beschrijving' }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Adres</span>
                <span class="id-value">{{ selectedVenue.fullAddress || 'Geen adres' }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Stad</span>
                <span class="id-value">{{ selectedVenue.city || '-' }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Openingstijden</span>
                <div class="id-value" v-html="selectedVenue.formattedHours"></div>
              </div>
              <div class="id-field">
                <span class="id-label">Status</span>
                <span class="id-value" :class="selectedVenue.currentlyOpen ? 'status-open' : 'status-closed'">
                  {{ selectedVenue.currentlyOpen ? '🟢 Open' : '🔴 Gesloten' }}
                </span>
              </div>
              <div class="id-field">
                <span class="id-label">Drukte</span>
                <span class="id-value">
                  <span v-if="selectedVenue.crowdLevelPercentage !== null && selectedVenue.crowdLevelPercentage !== undefined">
                    {{ selectedVenue.crowdLevelPercentage }}% vol
                    <span v-if="selectedVenue.pingCount > 0" class="ping-count">({{ selectedVenue.pingCount }} ping{{ selectedVenue.pingCount !== 1 ? 's' : '' }})</span>
                  </span>
                  <span v-else>Onbekend</span>
                </span>
              </div>
              <div v-if="selectedVenue.maxCap" class="id-field">
                <span class="id-label">Max Capaciteit</span>
                <span class="id-value">{{ selectedVenue.maxCap }} personen</span>
              </div>
              <div v-if="selectedVenue.averagePrice" class="id-field">
                <span class="id-label">Gemiddelde Prijs</span>
                <span class="id-value">{{ selectedVenue.averagePrice }}</span>
              </div>
            </div>
          </div>

          <!-- Ping Section -->
          <div class="ping-section">
            <h3 class="ping-title">Hoe druk is het hier?</h3>
            <p class="ping-description">Help anderen door te delen hoe vol het is (0-100%)</p>
            
            <div class="ping-controls">
              <div class="ping-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  :value="pingPercentage"
                  @input="handlePingSliderChange($event)"
                  class="ping-slider"
                  :disabled="pingSubmitting || !isAuthenticated"
                />
                <div class="ping-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div class="ping-display">
                <span class="ping-value">{{ pingPercentage }}%</span>
                <span class="ping-label">vol</span>
              </div>
              
              <button 
                type="button"
                class="ping-submit-btn"
                @click="submitPing"
                :disabled="pingSubmitting || !isAuthenticated"
              >
                <span v-if="pingSubmitting">Verzenden...</span>
                <span v-else-if="userLastPing">Ping bijwerken</span>
                <span v-else>Ping verzenden</span>
              </button>
              
              <div v-if="!isAuthenticated" class="ping-warning">
                ⚠️ Je moet ingelogd zijn om te pingen
              </div>
              
              <div v-if="userLastPing" class="ping-info">
                <span class="ping-info-text">Je laatste ping: {{ userLastPing.Percentage }}%</span>
                <span class="ping-info-time">{{ formatPingTime(userLastPing.TimeStamp) }}</span>
              </div>
              
              <div v-if="pingSuccess" class="ping-success">
                ✅ Ping verzonden!
              </div>
              
              <div v-if="!isAuthenticated" class="ping-warning">
                ⚠️ Je moet ingelogd zijn om te pingen
              </div>
            </div>
          </div>

          <!-- Sfeerbeelden Section -->
          <div v-if="selectedVenue.sfeerbeelden && selectedVenue.sfeerbeelden.length > 0" class="sfeerbeelden-section">
            <h3 class="sfeerbeelden-title">Sfeerbeelden</h3>
            <div class="sfeerbeelden-grid">
              <div 
                v-for="(sfeerbeeld, index) in selectedVenue.sfeerbeelden" 
                :key="index"
                class="sfeerbeeld-item"
              >
                <img :src="sfeerbeeld" :alt="`Sfeerbeeld ${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { venuesService } from '@/services/venues.service.js'
import { venuePingService } from '@/services/venueping.service.js'
import { useAuth } from '@/composables/useAuth.js'

const { isAuthenticated } = useAuth()

const searchQuery = ref('')

const filters = ref({
  openStatus: 'all',
  venueTypes: [],
  crowdLevelMin: 0,
  crowdLevelMax: 100
})

// Venues data from API
const venues = ref([])
const loading = ref(false)
const selectedVenue = ref(null)

// Ping system
const pingPercentage = ref(50)
const pingSubmitting = ref(false)
const pingSuccess = ref(false)
const userLastPing = ref(null)

// Fetch venues from API
const fetchVenues = async () => {
  loading.value = true
  try {
    const apiVenues = await venuesService.getAll()
    
    // Fetch crowd levels for all venues in parallel
    const venuesWithCrowdLevel = await Promise.all(
      apiVenues.map(async (venue) => {
        let crowdLevelData = null
        try {
          crowdLevelData = await venuePingService.getCrowdLevel(venue.VenueID)
          console.log(`[DEBUG] Venue ${venue.VenueID} (${venue.Name}):`, {
            crowdLevelData,
            percentage: crowdLevelData?.percentage,
            pingCount: crowdLevelData?.pingCount
          })
        } catch (error) {
          console.error(`[DEBUG] Error loading crowd level for venue ${venue.VenueID}:`, error)
        }
        return { venue, crowdLevelData }
      })
    )
    
    console.log('[DEBUG fetchVenues] Final venues with crowd levels:', venuesWithCrowdLevel.map(({ venue, crowdLevelData }) => ({
      id: venue.VenueID,
      name: venue.Name,
      crowdLevelPercentage: crowdLevelData?.percentage,
      type: typeof crowdLevelData?.percentage
    })))
    
    // Transform API data to our format
    venues.value = venuesWithCrowdLevel.map(({ venue, crowdLevelData }) => {
      const latestStatus = venue.venuestatus?.[0]
      const address = venue.venueaddress?.[0]
      const openingHours = venue.OpeningHours
      
      // Handle photo conversion - find hoofd foto first, then fallback to first foto
      let imageUrl = null
      let hoofdFotoUrl = null
      
      // Find hoofd foto (IsHoofdFoto = true)
      const hoofdFoto = venue.venuefoto?.find(f => f.IsHoofdFoto === true) || venue.venuefoto?.[0]
      
      if (hoofdFoto && hoofdFoto.Foto) {
        try {
          const base64 = arrayBufferToBase64(hoofdFoto.Foto)
          if (base64) {
            let mimeType = 'image/png'
            const firstChars = base64.substring(0, 20)
            if (firstChars.includes('/9j/')) {
              mimeType = 'image/jpeg'
            } else if (firstChars.includes('iVBORw0KGgo')) {
              mimeType = 'image/png'
            }
            hoofdFotoUrl = `data:${mimeType};base64,${base64}`
            imageUrl = hoofdFotoUrl // Use hoofd foto for list display
          }
        } catch (error) {
          console.error('Error converting hoofd foto:', error)
        }
      }
      
      // Handle sfeerbeelden
      const sfeerbeelden = []
      if (venue.venuesfeerbeeld && venue.venuesfeerbeeld.length > 0) {
        venue.venuesfeerbeeld.forEach(sfeerbeeld => {
          if (sfeerbeeld.Foto) {
            try {
              const base64 = arrayBufferToBase64(sfeerbeeld.Foto)
              if (base64) {
                let mimeType = 'image/png'
                const firstChars = base64.substring(0, 20)
                if (firstChars.includes('/9j/')) {
                  mimeType = 'image/jpeg'
                } else if (firstChars.includes('iVBORw0KGgo')) {
                  mimeType = 'image/png'
                }
                sfeerbeelden.push(`data:${mimeType};base64,${base64}`)
              }
            } catch (error) {
              console.error('Error converting sfeerbeeld:', error)
            }
          }
        })
      }
      
      return {
        id: venue.VenueID,
        VenueID: venue.VenueID,
        name: venue.Name,
        type: venue.venuetype?.VenueType || 'Onbekend',
        description: venue.Description || '',
        location: address?.City || 'Onbekend',
        address: address?.Address || '',
        fullAddress: address?.Address || 'Adres onbekend',
        city: address?.City || '',
        postalCode: address?.PostalCode || '',
        openingHours: openingHours,
        formattedHours: formatOpeningHours(openingHours),
        currentlyOpen: isCurrentlyOpen(openingHours),
        isOpen: latestStatus?.IsOpen ?? null, // Keep for backward compatibility
        crowdLevel: latestStatus?.CrowdLevel || 'Onbekend', // Keep for backward compatibility
        crowdLevelPercentage: crowdLevelData?.percentage ?? null,
        pingCount: crowdLevelData?.pingCount ?? 0,
        maxCap: venue.MaxCap,
        averagePrice: venue.AveragePrice,
        image: imageUrl,
        hoofdFoto: hoofdFotoUrl,
        sfeerbeelden: sfeerbeelden
      }
    })
  } catch (error) {
    console.error('Error fetching venues:', error)
    venues.value = []
  } finally {
    loading.value = false
  }
}

// Helper function to format opening hours beautifully
const formatOpeningHours = (openingHours) => {
  if (!openingHours) return 'Geen openingstijden bekend'
  
  if (typeof openingHours === 'string') {
    try {
      openingHours = JSON.parse(openingHours)
    } catch (e) {
      return openingHours
    }
  }
  
  if (typeof openingHours !== 'object' || Array.isArray(openingHours)) {
    return 'Geen openingstijden bekend'
  }
  
  // Day names mapping (Dutch)
  const dayNames = {
    'maandag': 'Ma',
    'dinsdag': 'Di',
    'woensdag': 'Wo',
    'donderdag': 'Do',
    'vrijdag': 'Vr',
    'zaterdag': 'Za',
    'zondag': 'Zo'
  }
  
  const dayOrder = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag']
  
  // Group consecutive days with same hours
  const groups = []
  let currentGroup = null
  
  dayOrder.forEach(day => {
    const hours = openingHours[day]
    if (hours) {
      if (currentGroup && currentGroup.hours === hours) {
        currentGroup.days.push(day)
      } else {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          days: [day],
          hours: hours
        }
      }
    } else {
      if (currentGroup) {
        groups.push(currentGroup)
        currentGroup = null
      }
    }
  })
  if (currentGroup) groups.push(currentGroup)
  
  // Format groups
  const formatted = groups.map(group => {
    const dayLabels = group.days.map(d => dayNames[d] || d).join(', ')
    return `${dayLabels}: ${group.hours}`
  })
  
  return formatted.length > 0 ? formatted.join('<br>') : 'Geen openingstijden bekend'
}

// Helper function to check if venue is currently open
const isCurrentlyOpen = (openingHours) => {
  if (!openingHours) return false
  
  // Parse if string
  if (typeof openingHours === 'string') {
    try {
      openingHours = JSON.parse(openingHours)
    } catch (e) {
      return false
    }
  }
  
  if (typeof openingHours !== 'object' || Array.isArray(openingHours)) {
    return false
  }
  
  // Get current day and time
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Map JavaScript day to Dutch day name
  const dayMap = {
    0: 'zondag',
    1: 'maandag',
    2: 'dinsdag',
    3: 'woensdag',
    4: 'donderdag',
    5: 'vrijdag',
    6: 'zaterdag'
  }
  
  const currentDayName = dayMap[currentDay]
  const todayHours = openingHours[currentDayName]
  
  if (!todayHours) return false
  
  // Parse time range (format: "09:00-21:00")
  const timeMatch = todayHours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/)
  if (!timeMatch) return false
  
  const openHour = parseInt(timeMatch[1])
  const openMinute = parseInt(timeMatch[2])
  const closeHour = parseInt(timeMatch[3])
  const closeMinute = parseInt(timeMatch[4])
  
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute
  const openTime = openHour * 60 + openMinute
  const closeTime = closeHour * 60 + closeMinute
  
  return currentTime >= openTime && currentTime < closeTime
}

// Helper function to convert ArrayBuffer/Buffer to base64
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
      console.log('Detected Prisma Buffer format with type and data')
      arrayBuffer = buffer.data
    }
    // Check for .data property (alternative Prisma format)
    else if (buffer.data && Array.isArray(buffer.data)) {
      console.log('Detected buffer with .data property (array)')
      arrayBuffer = buffer.data
    }
    // Direct array
    else if (Array.isArray(buffer)) {
      console.log('Detected direct array')
      arrayBuffer = buffer
    }
    // ArrayBuffer
    else if (buffer instanceof ArrayBuffer) {
      console.log('Detected ArrayBuffer')
      arrayBuffer = new Uint8Array(buffer)
    }
    // Uint8Array
    else if (buffer instanceof Uint8Array) {
      console.log('Detected Uint8Array')
      arrayBuffer = buffer
    }
    // Try to access .data if it exists (might be a Buffer object)
    else if (buffer.data) {
      console.log('Trying to use buffer.data directly')
      arrayBuffer = buffer.data
    }
    // Handle object with numeric keys (like {0: 255, 1: 216, ...})
    else if (typeof buffer === 'object' && !Array.isArray(buffer) && buffer.constructor === Object) {
      console.log('Detected object with numeric keys, converting to array')
      // Check if it looks like an array-like object (has numeric keys)
      const keys = Object.keys(buffer)
      const numericKeys = keys.filter(k => !isNaN(parseInt(k)))
      
      if (numericKeys.length > 0) {
        // Convert object with numeric keys to array
        const maxIndex = Math.max(...numericKeys.map(k => parseInt(k)))
        arrayBuffer = []
        for (let i = 0; i <= maxIndex; i++) {
          if (buffer[i] !== undefined) {
            arrayBuffer[i] = buffer[i]
          }
        }
        console.log(`Converted object to array, length: ${arrayBuffer.length}`)
      } else {
        console.warn('Object has no numeric keys, cannot convert')
        return null
      }
    }
    // Last resort: try to convert directly
    else {
      console.warn('Unknown buffer format, attempting direct conversion. Type:', typeof buffer, 'Buffer:', buffer)
      // Try to create Uint8Array from buffer
      try {
        arrayBuffer = new Uint8Array(buffer)
      } catch (e) {
        console.error('Failed to create Uint8Array from buffer:', e)
        return null
      }
    }
    
    // Convert to base64
    if (arrayBuffer) {
      let uint8Array
      
      if (Array.isArray(arrayBuffer)) {
        console.log('Converting array to Uint8Array, length:', arrayBuffer.length)
        uint8Array = new Uint8Array(arrayBuffer)
      } else if (arrayBuffer instanceof Uint8Array) {
        console.log('Using Uint8Array directly, length:', arrayBuffer.length)
        uint8Array = arrayBuffer
      } else {
        console.warn('arrayBuffer is not array or Uint8Array, type:', typeof arrayBuffer)
        return null
      }
      
      if (uint8Array.length === 0) {
        console.warn('Uint8Array is empty')
        return null
      }
      
      const base64 = btoa(
        uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      console.log('Successfully converted to base64, length:', base64.length)
      return base64
    } else {
      console.warn('arrayBuffer is null after processing')
      return null
    }
  } catch (error) {
    console.error('Error converting buffer to base64:', error)
    console.error('Error stack:', error.stack)
    console.error('Buffer type:', typeof buffer, 'Buffer:', buffer)
    return null
  }
}

// Handle image load errors
const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src)
  // Hide broken image
  event.target.style.display = 'none'
}

// Update open/closed status periodically
let statusUpdateInterval = null

// Function to update venue statuses
const updateVenueStatuses = () => {
  venues.value = venues.value.map(venue => ({
    ...venue,
    currentlyOpen: isCurrentlyOpen(venue.openingHours)
  }))
}

// Load venues on mount
onMounted(() => {
  fetchVenues()
  
  // Update status every minute
  statusUpdateInterval = setInterval(() => {
    updateVenueStatuses()
  }, 60000) // Update every 60 seconds
})

// Cleanup interval on unmount
onUnmounted(() => {
  if (statusUpdateInterval) {
    clearInterval(statusUpdateInterval)
  }
})

const filteredVenues = computed(() => {
  let result = [...venues.value]

  // Filter op zoekterm
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(venue => 
      venue.name.toLowerCase().includes(query) ||
      venue.description.toLowerCase().includes(query) ||
      venue.location.toLowerCase().includes(query) ||
      venue.type.toLowerCase().includes(query)
    )
  }

  // Filter op openingsstatus (gebruik currentlyOpen voor dynamische status)
  if (filters.value.openStatus === 'open') {
    result = result.filter(venue => venue.currentlyOpen === true)
  } else if (filters.value.openStatus === 'closed') {
    result = result.filter(venue => venue.currentlyOpen === false)
  }

  // Filter op venue type (normalize accents for comparison)
  if (filters.value.venueTypes.length > 0) {
    result = result.filter(venue => {
      const normalizedVenueType = venue.type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return filters.value.venueTypes.some(filterType => {
        const normalizedFilterType = filterType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return normalizedVenueType === normalizedFilterType
      })
    })
  }

  // Filter op bezetting percentage
  if (filters.value.crowdLevelMin > 0 || filters.value.crowdLevelMax < 100) {
    result = result.filter(venue => {
      const percentage = venue.crowdLevelPercentage
      if (percentage === null || percentage === undefined) {
        return false // Filter out venues without crowd level data
      }
      return percentage >= filters.value.crowdLevelMin && percentage <= filters.value.crowdLevelMax
    })
  }

  return result
})

const resetFilters = () => {
  filters.value = {
    openStatus: 'all',
    venueTypes: [],
    crowdLevelMin: 0,
    crowdLevelMax: 100
  }
  searchQuery.value = ''
}

// Update crowd level filter to ensure min <= max
const updateCrowdLevelFilter = () => {
  if (filters.value.crowdLevelMin > filters.value.crowdLevelMax) {
    filters.value.crowdLevelMin = filters.value.crowdLevelMax
  }
  if (filters.value.crowdLevelMax < filters.value.crowdLevelMin) {
    filters.value.crowdLevelMax = filters.value.crowdLevelMin
  }
}

// Open venue detail modal
const openVenueDetail = async (venue) => {
  // Fetch full venue data including sfeerbeelden
  try {
    const fullVenue = await venuesService.getById(venue.VenueID || venue.id)
    
    // Convert hoofd foto using arrayBufferToBase64 helper
    let hoofdFotoUrl = null
    const hoofdFoto = fullVenue.venuefoto?.find(f => f.IsHoofdFoto === true) || fullVenue.venuefoto?.[0]
    if (hoofdFoto && hoofdFoto.Foto) {
      try {
        const base64 = arrayBufferToBase64(hoofdFoto.Foto)
        if (base64) {
          let mimeType = 'image/png'
          const firstChars = base64.substring(0, 20)
          if (firstChars.includes('/9j/')) {
            mimeType = 'image/jpeg'
          } else if (firstChars.includes('iVBORw0KGgo')) {
            mimeType = 'image/png'
          }
          hoofdFotoUrl = `data:${mimeType};base64,${base64}`
        }
      } catch (error) {
        console.error('Error converting hoofd foto:', error)
      }
    }
    
    // Convert sfeerbeelden
    const sfeerbeelden = []
    if (fullVenue.venuesfeerbeeld && fullVenue.venuesfeerbeeld.length > 0) {
      fullVenue.venuesfeerbeeld.forEach(sfeerbeeld => {
        if (sfeerbeeld.Foto) {
          try {
            const base64 = arrayBufferToBase64(sfeerbeeld.Foto)
            if (base64) {
              let mimeType = 'image/png'
              const firstChars = base64.substring(0, 20)
              if (firstChars.includes('/9j/')) {
                mimeType = 'image/jpeg'
              } else if (firstChars.includes('iVBORw0KGgo')) {
                mimeType = 'image/png'
              }
              sfeerbeelden.push(`data:${mimeType};base64,${base64}`)
            }
          } catch (error) {
            console.error('Error converting sfeerbeeld:', error)
          }
        }
      })
    }
    
    const address = fullVenue.venueaddress?.[0]
    const openingHours = fullVenue.OpeningHours
    
    // Load crowd level from pings
    let crowdLevelData = null
    try {
      crowdLevelData = await venuePingService.getCrowdLevel(venue.VenueID || venue.id)
    } catch (error) {
      console.error('Error loading crowd level:', error)
    }
    
    // Load user's last ping
    let userPing = null
    if (isAuthenticated.value) {
      try {
        userPing = await venuePingService.getUserPing(venue.VenueID || venue.id)
        if (userPing) {
          pingPercentage.value = userPing.Percentage
          userLastPing.value = userPing
        } else {
          pingPercentage.value = 50
          userLastPing.value = null
        }
      } catch (error) {
        // User might not have pinged yet, that's okay - silently handle
        pingPercentage.value = 50
        userLastPing.value = null
      }
    }
    
    selectedVenue.value = {
      ...venue,
      name: fullVenue.Name,
      type: fullVenue.venuetype?.VenueType || 'Onbekend',
      description: fullVenue.Description || '',
      fullAddress: address?.Address || 'Adres onbekend',
      city: address?.City || '',
      postalCode: address?.PostalCode || '',
      openingHours: openingHours,
      formattedHours: formatOpeningHours(openingHours),
      currentlyOpen: isCurrentlyOpen(openingHours),
      crowdLevel: fullVenue.venuestatus?.[0]?.CrowdLevel || 'Onbekend',
      crowdLevelPercentage: crowdLevelData?.percentage || null,
      pingCount: crowdLevelData?.pingCount || 0,
      maxCap: fullVenue.MaxCap,
      averagePrice: fullVenue.AveragePrice,
      hoofdFoto: hoofdFotoUrl,
      sfeerbeelden: sfeerbeelden
    }
  } catch (error) {
    console.error('Error fetching venue details:', error)
    // Fallback to basic venue data
    selectedVenue.value = venue
  }
}

// Close venue detail modal
const closeVenueDetail = () => {
  selectedVenue.value = null
  pingSuccess.value = false
  pingPercentage.value = 50
  userLastPing.value = null
}

// Submit ping
const submitPing = async () => {
  if (!selectedVenue.value || !isAuthenticated.value || pingPercentage.value === null || pingPercentage.value === undefined) {
    return
  }
  
  pingSubmitting.value = true
  pingSuccess.value = false
  
  try {
    const venueId = selectedVenue.value.VenueID || selectedVenue.value.id
    
    let ping
    // If user has an existing ping, update it; otherwise create a new one
    if (userLastPing.value && userLastPing.value.PingID) {
      ping = await venuePingService.updatePing(venueId, pingPercentage.value, userLastPing.value.PingID)
    } else {
      ping = await venuePingService.createPing(venueId, pingPercentage.value)
    }
    
    // Update user's last ping
    userLastPing.value = ping
    
    // Refresh crowd level
    const crowdLevelData = await venuePingService.getCrowdLevel(venueId)
    if (selectedVenue.value) {
      selectedVenue.value.crowdLevelPercentage = crowdLevelData.percentage
      selectedVenue.value.pingCount = crowdLevelData.pingCount
    }
    
    pingSuccess.value = true
    setTimeout(() => {
      pingSuccess.value = false
    }, 3000)
  } catch (error) {
    // Silently handle errors - don't show error messages
    console.error('Error submitting ping:', error)
  } finally {
    pingSubmitting.value = false
  }
}

// Handle slider change
const handlePingSliderChange = (event) => {
  const value = parseInt(event.target.value)
  if (!isNaN(value)) {
    pingPercentage.value = value
    console.log('Slider changed to:', value)
  }
}

// Format ping time
const formatPingTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'zojuist'
  if (diffMins < 60) return `${diffMins} minuten geleden`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} uur geleden`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} dagen geleden`
}

const applyFilters = async () => {
  loading.value = true
  try {
    const apiFilters = {}
    
    if (searchQuery.value.trim()) {
      apiFilters.search = searchQuery.value.trim()
    }
    
    const apiVenues = await venuesService.getAll(apiFilters)
    
    // Transform and apply client-side filters
    let transformedVenues = apiVenues.map(venue => {
      const latestStatus = venue.venuestatus?.[0]
      const address = venue.venueaddress?.[0]
      const openingHours = venue.OpeningHours
      
      // Handle photo conversion - find hoofd foto first, then fallback to first foto
      let imageUrl = null
      let hoofdFotoUrl = null
      
      // Find hoofd foto (IsHoofdFoto = true)
      const hoofdFoto = venue.venuefoto?.find(f => f.IsHoofdFoto === true) || venue.venuefoto?.[0]
      
      if (hoofdFoto && hoofdFoto.Foto) {
        try {
          const base64 = arrayBufferToBase64(hoofdFoto.Foto)
          if (base64) {
            let mimeType = 'image/png'
            const firstChars = base64.substring(0, 20)
            if (firstChars.includes('/9j/')) {
              mimeType = 'image/jpeg'
            } else if (firstChars.includes('iVBORw0KGgo')) {
              mimeType = 'image/png'
            }
            hoofdFotoUrl = `data:${mimeType};base64,${base64}`
            imageUrl = hoofdFotoUrl
          }
        } catch (error) {
          console.error('Error converting hoofd foto:', error)
        }
      }
      
      // Handle sfeerbeelden
      const sfeerbeelden = []
      if (venue.venuesfeerbeeld && venue.venuesfeerbeeld.length > 0) {
        venue.venuesfeerbeeld.forEach(sfeerbeeld => {
          if (sfeerbeeld.Foto) {
            try {
              const base64 = arrayBufferToBase64(sfeerbeeld.Foto)
              if (base64) {
                let mimeType = 'image/png'
                const firstChars = base64.substring(0, 20)
                if (firstChars.includes('/9j/')) {
                  mimeType = 'image/jpeg'
                } else if (firstChars.includes('iVBORw0KGgo')) {
                  mimeType = 'image/png'
                }
                sfeerbeelden.push(`data:${mimeType};base64,${base64}`)
              }
            } catch (error) {
              console.error('Error converting sfeerbeeld:', error)
            }
          }
        })
      }
      
      return {
        id: venue.VenueID,
        VenueID: venue.VenueID,
        name: venue.Name,
        type: venue.venuetype?.VenueType || 'Onbekend',
        description: venue.Description || '',
        location: address?.City || 'Onbekend',
        address: address?.Address || '',
        fullAddress: address?.Address || 'Adres onbekend',
        city: address?.City || '',
        postalCode: address?.PostalCode || '',
        openingHours: openingHours,
        formattedHours: formatOpeningHours(openingHours),
        currentlyOpen: isCurrentlyOpen(openingHours),
        isOpen: latestStatus?.IsOpen ?? null, // Keep for backward compatibility
        crowdLevel: latestStatus?.CrowdLevel || 'Onbekend', // Keep for backward compatibility
        crowdLevelPercentage: null, // Will be loaded below
        pingCount: 0,
        image: imageUrl
      }
    })
    
    // Fetch crowd levels for all venues in parallel
    const venuesWithCrowdLevel = await Promise.all(
      transformedVenues.map(async (venue) => {
        let crowdLevelData = null
        try {
          crowdLevelData = await venuePingService.getCrowdLevel(venue.VenueID)
          console.log(`[DEBUG applyFilters] Venue ${venue.VenueID} (${venue.name}):`, {
            crowdLevelData,
            percentage: crowdLevelData?.percentage,
            pingCount: crowdLevelData?.pingCount
          })
        } catch (error) {
          console.error(`[DEBUG applyFilters] Error loading crowd level for venue ${venue.VenueID}:`, error)
        }
        return {
          ...venue,
          crowdLevelPercentage: crowdLevelData?.percentage ?? null,
          pingCount: crowdLevelData?.pingCount ?? 0
        }
      })
    )
    
    // Apply client-side filters (gebruik currentlyOpen voor dynamische status)
    let filteredVenues = venuesWithCrowdLevel
    
    if (filters.value.openStatus === 'open') {
      filteredVenues = filteredVenues.filter(v => v.currentlyOpen === true)
    } else if (filters.value.openStatus === 'closed') {
      filteredVenues = filteredVenues.filter(v => v.currentlyOpen === false)
    }
    
    if (filters.value.venueTypes.length > 0) {
      filteredVenues = filteredVenues.filter(v => {
        const normalizedVenueType = v.type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return filters.value.venueTypes.some(filterType => {
          const normalizedFilterType = filterType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          return normalizedVenueType === normalizedFilterType
        })
      })
    }
    
    // Filter op bezetting percentage
    if (filters.value.crowdLevelMin > 0 || filters.value.crowdLevelMax < 100) {
      filteredVenues = filteredVenues.filter(v => {
        const percentage = v.crowdLevelPercentage
        if (percentage === null || percentage === undefined) {
          return false // Filter out venues without crowd level data
        }
        return percentage >= filters.value.crowdLevelMin && percentage <= filters.value.crowdLevelMax
      })
    }
    
    venues.value = filteredVenues
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.content {
  flex: 1;
  padding: 32px;
  color: #eaeaea;
  background-color: #0f0f0f;
  min-height: 100vh;
}

.clublist-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* LEFT SIDEBAR */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 32px;
  height: fit-content;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

/* Search Section */
.search-section {
  width: 100%;
}

.search-container {
  display: flex;
  gap: 6px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  color: #eaeaea;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #9b5cff;
  box-shadow: 0 0 0 3px rgba(155, 92, 255, 0.1);
}

.search-input::placeholder {
  color: #666;
}

.search-button {
  padding: 10px 14px;
  background: #9b5cff;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.search-button:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* Filters Section */
.filters-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-section h2 {
  font-size: 20px;
  color: #9b5cff;
  margin: 0 0 4px 0;
}

.filter-card {
  background: rgba(18, 18, 18, 0.85);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #1f1f1f;
  backdrop-filter: blur(6px);
}

.filter-card h3 {
  color: #9b5cff;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}

/* Slider Filter Container */
.slider-filter-container {
  padding: 8px 0;
}

.slider-item {
  margin-bottom: 20px;
}

.slider-item:last-of-type {
  margin-bottom: 12px;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #eaeaea;
  font-weight: 500;
}

.slider-value {
  color: #9b5cff;
  font-weight: 600;
}

.range-slider {
  width: 100%;
  height: 6px;
  background: rgba(31, 31, 31, 0.8);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #9b5cff;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #0f0f0f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  background: #8a4de6;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(155, 92, 255, 0.5);
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #9b5cff;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #0f0f0f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.range-slider::-moz-range-thumb:hover {
  background: #8a4de6;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(155, 92, 255, 0.5);
}

.slider-info {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.filter-option:hover {
  background-color: rgba(155, 92, 255, 0.1);
}

.filter-option input[type="radio"],
.filter-option input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #9b5cff;
}

.filter-option span {
  color: #eaeaea;
  font-size: 13px;
}

/* Filter Actions */
.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-reset,
.btn-apply {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset {
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  color: #eaeaea;
}

.btn-reset:hover {
  background: rgba(31, 31, 31, 0.95);
  border-color: #2a2a2a;
}

.btn-apply {
  background: #9b5cff;
  color: white;
}

.btn-apply:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* RIGHT SIDE: Venues List */
.venues-list {
  display: flex;
  flex-direction: column;
}

.venues-header {
  margin-bottom: 24px;
}

.venues-header h2 {
  font-size: 32px;
  color: #9b5cff;
  margin: 0 0 8px 0;
}

.venues-count {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.venues-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.venue-card {
  background: rgba(18, 18, 18, 0.85);
  padding: 0;
  border-radius: 16px;
  border: 1px solid #1f1f1f;
  backdrop-filter: blur(6px);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.venue-card:hover {
  border-color: #9b5cff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(155, 92, 255, 0.2);
}

.venue-content {
  display: flex;
  gap: 0;
}

.venue-photo {
  width: 200px;
  min-width: 200px;
  height: 200px;
  background: rgba(15, 15, 15, 0.5);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  width: 100%;
  height: 100%;
}

.no-photo-placeholder svg {
  color: #444;
}

.no-photo-placeholder span {
  font-size: 12px;
  color: #666;
}

.venue-info {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.venue-header h3 {
  color: #9b5cff;
  font-size: 20px;
  margin: 0;
}

.venue-status {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.venue-status.open {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.venue-status.closed {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.venue-type {
  color: #9b5cff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.venue-description {
  color: #cfcfcf;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.venue-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.venue-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #999;
  font-size: 13px;
}

.venue-detail.venue-address,
.venue-detail.venue-hours {
  align-items: flex-start;
}

.address-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.address-street {
  color: #eaeaea;
  font-weight: 500;
}

.address-city {
  color: #999;
  font-size: 12px;
}

.opening-hours-text {
  line-height: 1.6;
  color: #cfcfcf;
}

.status-icon {
  margin-right: 4px;
  font-size: 10px;
}

.venue-detail svg {
  color: #9b5cff;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 18px;
}

.empty-subtitle {
  margin-top: 8px !important;
  font-size: 14px !important;
  color: #555 !important;
}

/* Custom Scrollbar Styling */
.left-sidebar::-webkit-scrollbar,
.venues-container::-webkit-scrollbar,
.content::-webkit-scrollbar {
  width: 8px;
}

.left-sidebar::-webkit-scrollbar-track,
.venues-container::-webkit-scrollbar-track,
.content::-webkit-scrollbar-track {
  background: rgba(15, 15, 15, 0.5);
  border-radius: 4px;
}

.left-sidebar::-webkit-scrollbar-thumb,
.venues-container::-webkit-scrollbar-thumb,
.content::-webkit-scrollbar-thumb {
  background: rgba(155, 92, 255, 0.3);
  border-radius: 4px;
}

.left-sidebar::-webkit-scrollbar-thumb:hover,
.venues-container::-webkit-scrollbar-thumb:hover,
.content::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 92, 255, 0.5);
}

/* Firefox scrollbar */
.left-sidebar,
.venues-container,
.content {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 92, 255, 0.3) rgba(15, 15, 15, 0.5);
}

/* Venue Detail Modal */
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
  padding: 20px;
  overflow-y: auto;
}

.venue-detail-modal {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.venue-detail-modal .id-card {
  margin: 0;
  background: rgba(18, 18, 18, 0.95);
  border: 2px solid #1f1f1f;
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.venue-detail-modal .id-card-header {
  background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.venue-detail-modal .id-card-header h2 {
  font-size: 24px;
  color: white;
  margin: 0;
}

.venue-detail-modal .id-card-body {
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

.venue-photo-large {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-photo-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.status-open {
  color: #22c55e;
}

.status-closed {
  color: #ef4444;
}

/* Ping Section */
.ping-section {
  padding: 24px 32px;
  border-top: 1px solid #1f1f1f;
  background: rgba(15, 15, 15, 0.3);
}

.ping-title {
  font-size: 18px;
  color: #9b5cff;
  margin: 0 0 8px 0;
}

.ping-description {
  font-size: 13px;
  color: #999;
  margin: 0 0 20px 0;
}

.ping-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ping-slider-container {
  position: relative;
  width: 100%;
  padding: 10px 0;
}

.ping-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(31, 31, 31, 0.8);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  z-index: 10;
  position: relative;
  margin: 0;
  padding: 0;
}

.ping-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: rgba(31, 31, 31, 0.8);
  border-radius: 4px;
}

.ping-slider::-moz-range-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: rgba(31, 31, 31, 0.8);
  border-radius: 4px;
}

.ping-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9b5cff;
  cursor: grab;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: -6px;
}

.ping-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.ping-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #9b5cff;
  cursor: grab;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ping-slider::-moz-range-thumb:active {
  cursor: grabbing;
}

.ping-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ping-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #666;
}

.ping-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
  justify-content: center;
}

.ping-value {
  font-size: 32px;
  font-weight: 700;
  color: #9b5cff;
}

.ping-label {
  font-size: 14px;
  color: #999;
}

.ping-submit-btn {
  padding: 12px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ping-submit-btn:hover:not(:disabled) {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

.ping-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ping-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.ping-info-text {
  color: #666;
}

.ping-info-time {
  color: #555;
  font-size: 11px;
}

.ping-error {
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
  text-align: center;
}

.ping-success {
  padding: 10px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #22c55e;
  font-size: 13px;
  text-align: center;
}

.ping-count {
  font-size: 11px;
  color: #666;
  margin-left: 4px;
}

.ping-warning {
  padding: 10px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 13px;
  text-align: center;
}

.sfeerbeelden-section {
  padding: 24px 32px;
  border-top: 1px solid #1f1f1f;
}

.sfeerbeelden-title {
  font-size: 18px;
  color: #9b5cff;
  margin: 0 0 16px 0;
}

.sfeerbeelden-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.sfeerbeeld-item {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
}

.sfeerbeeld-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Responsive */
@media (max-width: 1024px) {
  .clublist-layout {
    grid-template-columns: 1fr;
  }

  .left-sidebar {
    position: static;
    max-height: none;
  }

  .venue-content {
    flex-direction: column;
  }

  .venue-photo {
    width: 100%;
    min-width: 100%;
    height: 250px;
  }
}
</style>
