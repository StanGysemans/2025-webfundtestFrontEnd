<template>
  <main class="content">
    <!-- SEARCH BAR -->
    <section class="search-section">
      <div class="search-container">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Zoek naar venues, locaties..." 
          v-model="searchQuery"
          @keyup.enter="applyFilters"
        />
        <button class="search-button" @click="applyFilters">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </section>

    <!-- MAP -->
    <section class="map-section">
      <div class="map-container" ref="mapContainer">
        <div v-if="loading" class="map-loading">
          <p>Kaart laden...</p>
        </div>
      </div>
    </section>

    <!-- FILTERS -->
    <section class="filters-section">
      <h2>Filters</h2>
      
      <div class="filters-grid">
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
          <h3>Drukte</h3>
          <div class="filter-options">
            <label class="filter-option">
              <input 
                type="checkbox" 
                value="low" 
                v-model="filters.crowdLevels"
              />
              <span>Rustig</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                value="medium" 
                v-model="filters.crowdLevels"
              />
              <span>Gemiddeld</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                value="high" 
                v-model="filters.crowdLevels"
              />
              <span>Druk</span>
            </label>
            <label class="filter-option">
              <input 
                type="checkbox" 
                value="very-high" 
                v-model="filters.crowdLevels"
              />
              <span>Zeer Druk</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilters">Filters Resetten</button>
        <button class="btn-apply" @click="applyFilters">Filters Toepassen</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { venuesService } from '@/services/venues.service.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

const searchQuery = ref('')
const venues = ref([])
const filteredVenues = ref([])
const loading = ref(false)
const mapContainer = ref(null)
let map = null
let markers = []

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

// Initialize map
const initMap = () => {
  if (!mapContainer.value) return
  
  // Create map centered on Belgium (Brussels)
  map = L.map(mapContainer.value).setView([50.5039, 4.4699], 8)
  
  // Add dark mode map tiles (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)
}

// Clear all markers
const clearMarkers = () => {
  markers.forEach(marker => {
    map.removeLayer(marker)
  })
  markers = []
}

// Add markers to map
const addMarkersToMap = () => {
  clearMarkers()
  
  if (!map) return
  
  const venuesWithCoords = filteredVenues.value.filter(v => v.lat && v.lng)
  
  if (venuesWithCoords.length === 0) {
    return
  }
  
  // Create bounds for all venues
  const bounds = []
  
  venuesWithCoords.forEach(venue => {
    // Leaflet expects [latitude, longitude]
    // Check if coordinates might be swapped (common issue)
    // Belgium lat range: ~49.5 to 51.5, lng range: ~2.5 to 6.4
    let lat = venue.lat
    let lng = venue.lng
    
    // If lat is in lng range or vice versa, swap them
    if (lat >= 2.5 && lat <= 6.4 && lng >= 49.5 && lng <= 51.5) {
      // Coordinates are swapped
      console.warn(`Swapping coordinates for venue ${venue.name}:`, { originalLat: lat, originalLng: lng })
      const temp = lat
      lat = lng
      lng = temp
    }
    
    const marker = L.marker([lat, lng])
    
    // Create popup content
    const statusIcon = venue.currentlyOpen ? '🟢' : '🔴'
    const statusText = venue.currentlyOpen ? 'Open' : 'Gesloten'
    
    const popupContent = `
      <div class="map-popup">
        <h3 style="margin: 0 0 8px 0; color: #9b5cff; font-size: 18px;">${venue.name}</h3>
        <p style="margin: 4px 0; color: #999; font-size: 12px;">${venue.type}</p>
        <p style="margin: 4px 0; color: #eaeaea; font-size: 14px;">${venue.address || ''}${venue.address && venue.city ? ', ' : ''}${venue.city || ''}</p>
        <p style="margin: 8px 0 4px 0; color: #eaeaea; font-size: 13px;">
          <span style="margin-right: 8px;">${statusIcon} ${statusText}</span>
          <span>👥 ${venue.crowdLevel || 'Onbekend'}</span>
        </p>
        ${venue.description ? `<p style="margin: 8px 0 0 0; color: #cfcfcf; font-size: 12px;">${venue.description}</p>` : ''}
      </div>
    `
    
    marker.bindPopup(popupContent)
    marker.addTo(map)
    markers.push(marker)
    bounds.push([lat, lng])
  })
  
  // Fit map to show all markers
  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

// Fetch venues from API
const fetchVenues = async () => {
  loading.value = true
  try {
    const apiVenues = await venuesService.getAll()
    
    // Transform API data
    venues.value = apiVenues.map(venue => {
      const latestStatus = venue.venuestatus?.[0]
      const address = venue.venueaddress?.[0]
      const openingHours = venue.OpeningHours
      
      return {
        id: venue.VenueID,
        VenueID: venue.VenueID,
        name: venue.Name,
        type: venue.venuetype?.VenueType || 'Onbekend',
        description: venue.Description || '',
        location: address?.City || 'Onbekend',
        address: address?.Address || '',
        city: address?.City || '',
        postalCode: address?.PostalCode || '',
        lat: address?.Lat ? parseFloat(address.Lat) : null,
        lng: address?.Lng ? parseFloat(address.Lng) : null,
        openingHours: openingHours,
        currentlyOpen: isCurrentlyOpen(openingHours),
        isOpen: latestStatus?.IsOpen ?? null, // Keep for backward compatibility
        crowdLevel: latestStatus?.CrowdLevel || 'Onbekend'
      }
    })
    
    // Apply initial filters
    applyFilters()
  } catch (error) {
    console.error('Error fetching venues:', error)
    venues.value = []
  } finally {
    loading.value = false
  }
}

const filters = ref({
  openStatus: 'all',
  venueTypes: [],
  crowdLevels: []
})

// Load venues on mount
onMounted(async () => {
  // Initialize map
  await nextTick()
  initMap()
  
  // Fetch venues
  await fetchVenues()
})

// Cleanup on unmount
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

const resetFilters = () => {
  filters.value = {
    openStatus: 'all',
    venueTypes: [],
    crowdLevels: []
  }
  searchQuery.value = ''
  applyFilters()
}

const applyFilters = async () => {
  loading.value = true
  try {
    let filtered = [...venues.value]
    
    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(query) ||
        venue.description.toLowerCase().includes(query) ||
        venue.location.toLowerCase().includes(query) ||
        venue.type.toLowerCase().includes(query) ||
        (venue.address && venue.address.toLowerCase().includes(query)) ||
        (venue.city && venue.city.toLowerCase().includes(query))
      )
    }
    
    // Apply open/closed filter (use currentlyOpen for dynamic status)
    if (filters.value.openStatus === 'open') {
      filtered = filtered.filter(v => v.currentlyOpen === true)
    } else if (filters.value.openStatus === 'closed') {
      filtered = filtered.filter(v => v.currentlyOpen === false)
    }
    
    // Apply venue type filter
    if (filters.value.venueTypes.length > 0) {
      filtered = filtered.filter(v => {
        const venueTypeLower = v.type.toLowerCase()
        return filters.value.venueTypes.some(filterType => 
          venueTypeLower.includes(filterType.toLowerCase())
        )
      })
    }
    
    // Apply crowd level filter
    if (filters.value.crowdLevels.length > 0) {
      const crowdMap = {
        'low': 'Rustig',
        'medium': 'Gemiddeld',
        'high': 'Druk',
        'very-high': 'Zeer Druk'
      }
      const crowdLevels = filters.value.crowdLevels.map(level => crowdMap[level])
      filtered = filtered.filter(v => 
        crowdLevels.includes(v.crowdLevel)
      )
    }
    
    filteredVenues.value = filtered
    
    // Update markers on map
    nextTick(() => {
      addMarkersToMap()
    })
  } catch (error) {
    console.error('Error applying filters:', error)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes to auto-apply
watch(() => filters.value, () => {
  applyFilters()
}, { deep: true })
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
}

/* Search Section */
.search-section {
  width: 100%;
  max-width: 800px;
  margin-bottom: 48px;
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 16px 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  color: #eaeaea;
  font-size: 16px;
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
  padding: 16px 24px;
  background: #9b5cff;
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* Map Section */
.map-section {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 64px;
}

.map-container {
  width: 100%;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.map-container {
  position: relative;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(18, 18, 18, 0.9);
  padding: 20px 40px;
  border-radius: 12px;
  color: #9b5cff;
  font-size: 16px;
  font-weight: 600;
}

/* Leaflet dark theme adjustments */
:deep(.leaflet-container) {
  background: #0f0f0f;
  border: 1px solid #1f1f1f;
}

:deep(.leaflet-popup-content-wrapper) {
  background: rgba(18, 18, 18, 0.98);
  color: #eaeaea;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

:deep(.leaflet-popup-tip) {
  background: rgba(18, 18, 18, 0.98);
  border: 1px solid #2a2a2a;
}

:deep(.leaflet-popup-close-button) {
  color: #9b5cff;
  font-size: 20px;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

:deep(.leaflet-popup-close-button:hover) {
  color: #8a4de6;
  background: rgba(155, 92, 255, 0.1);
  border-radius: 4px;
}

:deep(.leaflet-control-zoom) {
  border: 1px solid #2a2a2a;
  background: rgba(18, 18, 18, 0.9);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(18, 18, 18, 0.9);
  color: #9b5cff;
  border-bottom: 1px solid #2a2a2a;
  transition: all 0.2s ease;
}

:deep(.leaflet-control-zoom a:hover) {
  background: rgba(155, 92, 255, 0.1);
  color: #8a4de6;
}

:deep(.leaflet-control-zoom a:last-child) {
  border-bottom: none;
}

:deep(.leaflet-control-attribution) {
  background: rgba(18, 18, 18, 0.8);
  color: #999;
  border-top: 1px solid #2a2a2a;
  font-size: 11px;
}

:deep(.leaflet-control-attribution a) {
  color: #9b5cff;
  transition: color 0.2s ease;
}

:deep(.leaflet-control-attribution a:hover) {
  color: #8a4de6;
}

/* Filters Section */
.filters-section {
  width: 100%;
  max-width: 1200px;
}

.filters-section h2 {
  font-size: 36px;
  color: #9b5cff;
  margin-bottom: 32px;
  text-align: center;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.filter-card {
  background: rgba(18, 18, 18, 0.85);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #1f1f1f;
  backdrop-filter: blur(6px);
}

.filter-card h3 {
  color: #9b5cff;
  margin-bottom: 16px;
  font-size: 20px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.filter-option:hover {
  background-color: rgba(155, 92, 255, 0.1);
}

.filter-option input[type="radio"],
.filter-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #9b5cff;
}

.filter-option span {
  color: #eaeaea;
  font-size: 16px;
}

/* Filter Actions */
.filter-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

.btn-reset,
.btn-apply {
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
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
</style>
