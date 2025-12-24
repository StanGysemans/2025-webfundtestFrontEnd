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
      
      <!-- Location Tracking Controls -->
      <div class="location-controls">
        <div class="location-toggle">
          <label class="toggle-label">
            <span>Locatie volgen</span>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="locationTrackingEnabled"
                @change="onLocationTrackingChange"
                :disabled="!locationPermissionGranted"
              />
              <span class="slider"></span>
            </div>
          </label>
          <button 
            v-if="!locationPermissionGranted" 
            class="btn-request-location"
            @click="requestLocationPermission"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Toestemming vragen
          </button>
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
      </div>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <button class="btn-reset" @click="resetFilters">Filters Resetten</button>
        <button class="btn-apply" @click="applyFilters">Filters Toepassen</button>
      </div>
    </section>

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
                <span class="id-value">{{ selectedVenue.address || 'Geen adres' }}{{ selectedVenue.address && selectedVenue.city ? ', ' : '' }}{{ selectedVenue.city || '' }}</span>
              </div>
              <div class="id-field">
                <span class="id-label">Openingstijden</span>
                <div class="id-value" v-html="selectedVenue.formattedHours || 'Geen openingstijden bekend'"></div>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { venuesService } from '@/services/venues.service.js'
import { venuePingService } from '@/services/venueping.service.js'
import { usersService } from '@/services/users.service.js'
import { useAuth } from '@/composables/useAuth.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const { isAuthenticated } = useAuth()

// Create custom purple marker icon
const createPurpleIcon = () => {
  // Create a purple marker using SVG (standard Leaflet marker shape)
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .marker-fill { fill: #9b5cff; }
          .marker-stroke { stroke: #6d28d9; stroke-width: 1.5; fill: none; }
          .marker-dot { fill: #ffffff; }
        </style>
      </defs>
      <path class="marker-fill marker-stroke" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.284 12.5 28.5 12.5 28.5S25 20.784 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle class="marker-dot" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `
  
  // Convert SVG to data URL
  const svgBlob = new Blob([svgIcon], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  
  return L.icon({
    iconUrl: url,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  })
}

const PurpleIcon = createPurpleIcon()

const searchQuery = ref('')
const venues = ref([])
const filteredVenues = ref([])
const loading = ref(false)
const mapContainer = ref(null)
const selectedVenue = ref(null)
let map = null
let markers = []

// Location tracking
const locationPermissionGranted = ref(false)
const locationTrackingEnabled = ref(false)
let userLocationMarker = null
let lastKnownLocationMarker = null
let watchId = null
let userLocation = null
let lastKnownLocation = null

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
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }
  
  try {
    // Check if we should center on user location
    const savedTrackingPreference = localStorage.getItem('locationTrackingEnabled')
    const savedLocation = localStorage.getItem('userLocation')
    
    let initialCenter = [50.5039, 4.4699] // Default: Brussels, Belgium
    let initialZoom = 8
    
    if (savedLocation && savedTrackingPreference === 'true') {
      try {
        const location = JSON.parse(savedLocation)
        if (location.lat && location.lng) {
          initialCenter = [location.lat, location.lng]
          initialZoom = 13
          locationTrackingEnabled.value = true
          locationPermissionGranted.value = true
          userLocation = location
        }
      } catch (e) {
        console.error('Error parsing saved location:', e)
      }
    }
    
    // Create map
    map = L.map(mapContainer.value).setView(initialCenter, initialZoom)
    
    // Add dark mode map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)
    
    console.log('Map initialized successfully')
    
    // Wait for map to be fully loaded before adding markers
    map.whenReady(() => {
      console.log('Map is ready')
      
      // If tracking is enabled, start it
      if (locationTrackingEnabled.value && locationPermissionGranted.value) {
        startLocationTracking()
      } else if (lastKnownLocation) {
        // Show last known location if tracking is disabled
        addLastKnownLocationMarker()
      }
    })
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

// Request location permission
const requestLocationPermission = async () => {
  if (!navigator.geolocation) {
    alert('Geolocatie wordt niet ondersteund door je browser')
    return
  }
  
  try {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationPermissionGranted.value = true
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || null
        }
        
        // Center map on user location with appropriate zoom based on accuracy
        if (map) {
          const accuracy = position.coords.accuracy || 50
          // Zoom level based on accuracy: smaller accuracy = higher zoom
          // Accuracy is in meters, so we calculate zoom level
          const zoom = accuracy < 20 ? 17 : accuracy < 50 ? 16 : accuracy < 100 ? 15 : 14
          map.setView([userLocation.lat, userLocation.lng], zoom)
          addUserLocationMarker()
        }
        
        // Update last known location
        lastKnownLocation = { ...userLocation }
        
        // Save to localStorage
        localStorage.setItem('userLocation', JSON.stringify(userLocation))
        localStorage.setItem('locationPermissionGranted', 'true')
        
        // Save to backend
        saveLocationPreference()
        
        // If tracking is enabled, start it
        if (locationTrackingEnabled.value) {
          startLocationTracking()
        } else if (lastKnownLocation) {
          // Show last known location if tracking is disabled
          addLastKnownLocationMarker()
        }
      },
      (error) => {
        console.error('Location permission denied:', error)
        let errorMessage = 'Locatie toestemming is geweigerd.'
        if (error.code === 1) {
          errorMessage = 'Locatie toestemming is geweigerd. Je kunt dit later aanpassen in je browser instellingen.'
        } else if (error.code === 2) {
          errorMessage = 'Locatie niet beschikbaar. Controleer je GPS instellingen.'
        } else if (error.code === 3) {
          errorMessage = 'Timeout bij het ophalen van locatie. Probeer het opnieuw.'
        }
        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Longer timeout for better GPS fix
        maximumAge: 0 // Don't use cached positions for initial request
      }
    )
  } catch (error) {
    console.error('Error requesting location:', error)
    alert('Er is een fout opgetreden bij het ophalen van je locatie')
  }
}

// Start location tracking
let lastSavedLocation = null
let updateCount = 0
let bestAccuracy = null // Track best accuracy we've seen

const startLocationTracking = () => {
  if (!navigator.geolocation || !map) return
  
  // Clear existing watch
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
  
  // Reset best accuracy
  bestAccuracy = null
  
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy || null,
        timestamp: position.timestamp || Date.now()
      }
      
      // CRITICAL: Only accept locations with good accuracy
      // Reject locations with accuracy worse than 100 meters (or if accuracy is missing and we had a good one before)
      const MAX_ACCEPTABLE_ACCURACY = 100 // meters
      
      if (newLocation.accuracy && newLocation.accuracy > MAX_ACCEPTABLE_ACCURACY) {
        console.warn(`Rejecting location update: accuracy too poor (${Math.round(newLocation.accuracy)}m)`)
        // Don't update if accuracy is too poor, but keep using last good location
        return
      }
      
      // If we don't have accuracy but we had a good location before, don't update
      if (!newLocation.accuracy && bestAccuracy && bestAccuracy < MAX_ACCEPTABLE_ACCURACY) {
        console.warn('Rejecting location update: no accuracy data and we have a better location')
        return
      }
      
      // Track best accuracy we've seen
      if (newLocation.accuracy) {
        if (!bestAccuracy || newLocation.accuracy < bestAccuracy) {
          bestAccuracy = newLocation.accuracy
          console.log(`Best accuracy improved to: ${Math.round(bestAccuracy)}m`)
        }
      }
      
      // Only update if location has changed significantly (more than 10 meters)
      // or if accuracy has improved significantly
      let shouldUpdate = false
      
      if (!lastSavedLocation) {
        shouldUpdate = true
      } else {
        // Calculate distance between old and new location (Haversine formula)
        const R = 6371e3 // Earth radius in meters
        const φ1 = lastSavedLocation.lat * Math.PI / 180
        const φ2 = newLocation.lat * Math.PI / 180
        const Δφ = (newLocation.lat - lastSavedLocation.lat) * Math.PI / 180
        const Δλ = (newLocation.lng - lastSavedLocation.lng) * Math.PI / 180
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c // Distance in meters
        
        // Only update if:
        // 1. Moved more than 10 meters AND new accuracy is acceptable
        // 2. Accuracy improved significantly (30% better) AND new accuracy is acceptable
        const accuracyImproved = newLocation.accuracy && lastSavedLocation.accuracy &&
          (newLocation.accuracy < lastSavedLocation.accuracy * 0.7) // 30% improvement
        
        const newAccuracyAcceptable = !newLocation.accuracy || newLocation.accuracy <= MAX_ACCEPTABLE_ACCURACY
        
        shouldUpdate = (distance > 10 && newAccuracyAcceptable) || (accuracyImproved && newAccuracyAcceptable)
        
        // If new location has worse accuracy than what we have, don't update unless moved significantly
        if (newLocation.accuracy && lastSavedLocation.accuracy && 
            newLocation.accuracy > lastSavedLocation.accuracy * 1.5 && distance < 50) {
          console.warn(`Rejecting update: accuracy degraded (${Math.round(lastSavedLocation.accuracy)}m → ${Math.round(newLocation.accuracy)}m)`)
          shouldUpdate = false
        }
      }
      
      if (shouldUpdate) {
        userLocation = newLocation
        
        // Smoothly pan map to new location (don't jump)
        const currentCenter = map.getCenter()
        const distance = map.distance(currentCenter, [userLocation.lat, userLocation.lng])
        
        // Only pan if moved significantly (more than 50 meters on map)
        if (distance > 50) {
          // Smooth pan animation
          map.panTo([userLocation.lat, userLocation.lng], {
            animate: true,
            duration: 1.0
          })
        }
        
        // Update marker
        addUserLocationMarker()
        
        // Update last known location
        lastKnownLocation = { ...newLocation }
        
        // Save to localStorage
        localStorage.setItem('userLocation', JSON.stringify(userLocation))
        
        // Save to backend every 5 updates or every 30 seconds
        updateCount++
        const timeSinceLastSave = lastSavedLocation ? 
          (newLocation.timestamp - (lastSavedLocation.timestamp || 0)) : 30000
        
        if (updateCount % 5 === 0 || timeSinceLastSave > 30000) {
          saveLocationPreference()
          lastSavedLocation = { ...newLocation }
          updateCount = 0
        }
      }
    },
    (error) => {
      console.error('Location tracking error:', error)
      if (error.code === 1) {
        console.warn('Location permission denied during tracking')
        locationPermissionGranted.value = false
        locationTrackingEnabled.value = false
        stopLocationTracking()
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 20000, // Longer timeout for better GPS fix
      maximumAge: 2000, // Only use very fresh positions (2 seconds max)
    }
  )
}

// Stop location tracking
const stopLocationTracking = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  
  // Remove user location marker and accuracy circle
  if (userLocationMarker && map) {
    map.removeLayer(userLocationMarker)
    userLocationMarker = null
  }
  
  if (userLocationAccuracyCircle && map) {
    map.removeLayer(userLocationAccuracyCircle)
    userLocationAccuracyCircle = null
  }
  
  // Show last known location if available (when tracking is disabled)
  if (lastKnownLocation && !locationTrackingEnabled.value) {
    addLastKnownLocationMarker()
  }
  
  // Reset tracking variables
  lastSavedLocation = null
  updateCount = 0
  bestAccuracy = null
}

// Add user location marker
const addUserLocationMarker = () => {
  if (!map || !userLocation) return
  
  // Remove existing marker and accuracy circle
  if (userLocationMarker) {
    map.removeLayer(userLocationMarker)
  }
  if (userLocationAccuracyCircle) {
    map.removeLayer(userLocationAccuracyCircle)
  }
  
  // Create blue circle marker for user location
  userLocationMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
    radius: 10,
    fillColor: '#3b82f6',
    color: '#ffffff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map)
  
  // Add accuracy circle if accuracy is available
  if (userLocation.accuracy && userLocation.accuracy > 0) {
    userLocationAccuracyCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: userLocation.accuracy,
      fillColor: '#3b82f6',
      color: '#3b82f6',
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0.1
    }).addTo(map)
  }
  
  // Add popup with accuracy info
  const accuracyText = userLocation.accuracy ? 
    `Jouw locatie (±${Math.round(userLocation.accuracy)}m)` : 
    'Jouw locatie'
  userLocationMarker.bindPopup(accuracyText)
  
  // Only open popup on first add
  if (!userLocationMarker._popupOpened) {
    userLocationMarker.openPopup()
    userLocationMarker._popupOpened = true
  }
}

let userLocationAccuracyCircle = null

// Add last known location marker (different from live tracking)
const addLastKnownLocationMarker = () => {
  if (!map || !lastKnownLocation) return
  
  // Remove existing marker if it exists
  if (lastKnownLocationMarker) {
    map.removeLayer(lastKnownLocationMarker)
  }
  
  // Create orange/yellow circle marker for last known location
  lastKnownLocationMarker = L.circleMarker([lastKnownLocation.lat, lastKnownLocation.lng], {
    radius: 8,
    fillColor: '#f59e0b',
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(map)
  
  // Add popup
  lastKnownLocationMarker.bindPopup('Laatst bekende locatie')
  
  // Add to map bounds if needed
  if (map.getZoom() < 10) {
    map.setView([lastKnownLocation.lat, lastKnownLocation.lng], 12)
  }
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
  if (!map) {
    console.warn('Map not initialized yet, cannot add markers')
    return
  }
  
  clearMarkers()
  
  const venuesWithCoords = filteredVenues.value.filter(v => v.lat && v.lng)
  
  console.log('Adding markers:', {
    totalVenues: filteredVenues.value.length,
    venuesWithCoords: venuesWithCoords.length,
    venues: venuesWithCoords.map(v => ({ name: v.name, lat: v.lat, lng: v.lng }))
  })
  
  if (venuesWithCoords.length === 0) {
    console.log('No venues with coordinates to display')
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
    
    const marker = L.marker([lat, lng], { icon: PurpleIcon })
    
    // Create popup content
    const statusIcon = venue.currentlyOpen ? '🟢' : '🔴'
    const statusText = venue.currentlyOpen ? 'Open' : 'Gesloten'
    
    // Build full address for Google Maps
    const fullAddress = [venue.address, venue.city, venue.postalCode].filter(Boolean).join(', ')
    const googleMapsUrl = venue.lat && venue.lng 
      ? `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`
      : fullAddress 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
        : null
    
    const popupContent = `
      <div class="map-popup">
        <h3 style="margin: 0 0 8px 0; color: #9b5cff; font-size: 18px;">${venue.name}</h3>
        <p style="margin: 4px 0; color: #999; font-size: 12px;">${venue.type}</p>
        <p style="margin: 4px 0; color: #eaeaea; font-size: 14px;">${venue.address || ''}${venue.address && venue.city ? ', ' : ''}${venue.city || ''}</p>
        <p style="margin: 8px 0 4px 0; color: #eaeaea; font-size: 13px;">
          <span style="margin-right: 8px;">${statusIcon} ${statusText}</span>
          <span>👥 ${venue.crowdLevelPercentage !== null && venue.crowdLevelPercentage !== undefined ? venue.crowdLevelPercentage + '% vol' : 'Onbekend'}</span>
        </p>
        ${venue.description ? `<p style="margin: 8px 0 0 0; color: #cfcfcf; font-size: 12px;">${venue.description}</p>` : ''}
        ${googleMapsUrl ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a2a2a;">
            <a href="${googleMapsUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #9b5cff; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; transition: background 0.2s;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Navigeer met Google Maps
            </a>
          </div>
        ` : ''}
      </div>
    `
    
    marker.bindPopup(popupContent, {
      closeOnClick: false, // Don't close popup when clicking on marker
      autoClose: false, // Don't auto-close when opening another popup
      closeOnEscapeKey: true
    })
    
    // Add hover event to show popup
    marker.on('mouseover', () => {
      marker.openPopup()
    })
    
    // Optionally close popup on mouseout (comment out if you want popup to stay open)
    // marker.on('mouseout', () => {
    //   marker.closePopup()
    // })
    
    // Add click event to open venue detail modal
    marker.on('click', () => {
      openVenueDetail(venue)
    })
    
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
    
    // Fetch crowd levels for all venues in parallel
    const venuesWithCrowdLevel = await Promise.all(
      apiVenues.map(async (venue) => {
        let crowdLevelData = null
        try {
          crowdLevelData = await venuePingService.getCrowdLevel(venue.VenueID)
        } catch (error) {
          // Silently handle errors - venue might not have pings yet
        }
        return { venue, crowdLevelData }
      })
    )
    
    // Transform API data
    venues.value = venuesWithCrowdLevel.map(({ venue, crowdLevelData }) => {
      const latestStatus = venue.venuestatus?.[0]
      const address = venue.venueaddress?.[0]
      const openingHours = venue.OpeningHours
      
      // Parse coordinates - handle Decimal type from Prisma
      let lat = null
      let lng = null
      
      if (address?.Lat) {
        lat = typeof address.Lat === 'string' ? parseFloat(address.Lat) : Number(address.Lat)
        if (isNaN(lat)) lat = null
      }
      
      if (address?.Lng) {
        lng = typeof address.Lng === 'string' ? parseFloat(address.Lng) : Number(address.Lng)
        if (isNaN(lng)) lng = null
      }
      
      console.log('Venue:', venue.Name, 'Address:', address, 'Coords:', { lat, lng })
      
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
        lat: lat,
        lng: lng,
        openingHours: openingHours,
        formattedHours: formatOpeningHours(openingHours),
        currentlyOpen: isCurrentlyOpen(openingHours),
        isOpen: latestStatus?.IsOpen ?? null, // Keep for backward compatibility
        crowdLevel: latestStatus?.CrowdLevel || 'Onbekend', // Keep for backward compatibility
        crowdLevelPercentage: crowdLevelData?.percentage || null,
        pingCount: crowdLevelData?.pingCount || 0,
        hoofdFoto: null, // Will be loaded when opening detail modal
        sfeerbeelden: [] // Will be loaded when opening detail modal
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
  crowdLevelMin: 0,
  crowdLevelMax: 100
})

// Save location preference to backend
const saveLocationPreference = async () => {
  try {
    if (!isAuthenticated.value) {
      return // Not logged in, only use localStorage
    }
    
    await usersService.updateLocationPreference({
      locationTrackingEnabled: locationTrackingEnabled.value,
      locationLat: userLocation?.lat || null,
      locationLng: userLocation?.lng || null
    })
  } catch (error) {
    console.error('Error saving location preference to backend:', error)
    // Continue anyway, localStorage is saved
  }
}

// Load location preference from backend
const loadLocationPreference = async () => {
  try {
    if (!isAuthenticated.value) {
      return // Not logged in, only use localStorage
    }
    
    const preference = await usersService.getLocationPreference()
    
    if (preference) {
      locationTrackingEnabled.value = preference.locationTrackingEnabled || false
      
      if (preference.locationLat && preference.locationLng) {
        // Store as last known location
        lastKnownLocation = {
          lat: preference.locationLat,
          lng: preference.locationLng
        }
        
        // If tracking is enabled, use it as current location too
        if (locationTrackingEnabled.value) {
          userLocation = {
            lat: preference.locationLat,
            lng: preference.locationLng
          }
          locationPermissionGranted.value = true
          
          // Update localStorage
          localStorage.setItem('userLocation', JSON.stringify(userLocation))
          localStorage.setItem('locationTrackingEnabled', locationTrackingEnabled.value.toString())
          localStorage.setItem('locationPermissionGranted', 'true')
        } else {
          // Just show last known location marker
          await nextTick()
          if (map) {
            addLastKnownLocationMarker()
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading location preference from backend:', error)
    // Fall back to localStorage
  }
}

// Load venues on mount
onMounted(async () => {
  // Wait for DOM to be ready
  await nextTick()
  
  // Try to load from backend first, then fall back to localStorage
  await loadLocationPreference()
  
  // Fall back to localStorage if backend didn't have preferences
  if (!locationTrackingEnabled.value) {
    const savedTracking = localStorage.getItem('locationTrackingEnabled')
    if (savedTracking === 'true') {
      locationTrackingEnabled.value = true
    }
  }
  
  if (!locationPermissionGranted.value) {
    const savedPermission = localStorage.getItem('locationPermissionGranted')
    if (savedPermission === 'true') {
      locationPermissionGranted.value = true
    }
  }
  
  // Initialize map first
  initMap()
  
  // Wait a bit for map to initialize
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Fetch venues
  await fetchVenues()
})

// Handle location tracking toggle change
const onLocationTrackingChange = async () => {
  if (locationTrackingEnabled.value) {
    if (!locationPermissionGranted.value) {
      // Request permission first
      await requestLocationPermission()
    } else {
      // Start tracking
      startLocationTracking()
    }
  } else {
    // Stop tracking
    stopLocationTracking()
  }
  
  // Save preference
  localStorage.setItem('locationTrackingEnabled', locationTrackingEnabled.value.toString())
  
  // If tracking is disabled, show last known location
  if (!locationTrackingEnabled.value && lastKnownLocation) {
    addLastKnownLocationMarker()
  } else if (locationTrackingEnabled.value && lastKnownLocationMarker) {
    // Remove last known location marker when tracking is enabled
    if (map && lastKnownLocationMarker) {
      map.removeLayer(lastKnownLocationMarker)
      lastKnownLocationMarker = null
    }
  }
  
  // Save to backend
  try {
    await saveLocationPreference()
  } catch (error) {
    console.error('Error saving location preference to backend:', error)
    // Continue anyway, localStorage is saved
  }
}

// Open venue detail modal
const openVenueDetail = async (venue) => {
  // Fetch full venue data including sfeerbeelden
  try {
    const fullVenue = await venuesService.getById(venue.VenueID || venue.id)
    
    // Convert hoofd foto - use the same helper function as ClubList
    let hoofdFotoUrl = null
    const hoofdFoto = fullVenue.venuefoto?.find(f => f.IsHoofdFoto === true) || fullVenue.venuefoto?.[0]
    if (hoofdFoto && hoofdFoto.Foto) {
      try {
        // Use arrayBufferToBase64 helper function (same as ClubList)
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
      // Silently handle errors
    }
    
    selectedVenue.value = {
      ...venue,
      name: fullVenue.Name,
      type: fullVenue.venuetype?.VenueType || 'Onbekend',
      description: fullVenue.Description || '',
      address: address?.Address || '',
      city: address?.City || '',
      postalCode: address?.PostalCode || '',
      openingHours: openingHours,
      formattedHours: formatOpeningHours(openingHours),
      currentlyOpen: isCurrentlyOpen(openingHours),
      crowdLevel: fullVenue.venuestatus?.[0]?.CrowdLevel || 'Onbekend', // Keep for backward compatibility
      crowdLevelPercentage: crowdLevelData?.percentage || null,
      pingCount: crowdLevelData?.pingCount || 0,
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
}

// Helper function to convert buffer to base64 (same as ClubList)
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
      } else {
        console.warn('Object has no numeric keys, cannot convert')
        return null
      }
    }
    // Try to access .data if it exists (might be a Buffer object)
    else if (buffer.data) {
      arrayBuffer = buffer.data
    }
    
    if (arrayBuffer) {
      // Convert to Uint8Array if needed
      const uint8Array = arrayBuffer instanceof Uint8Array 
        ? arrayBuffer 
        : new Uint8Array(arrayBuffer)
      
      // Convert to base64
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

// Helper function to format opening hours
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
  
  const formatted = groups.map(group => {
    const dayLabels = group.days.map(d => dayNames[d] || d).join(', ')
    return `${dayLabels}: ${group.hours}`
  })
  
  return formatted.length > 0 ? formatted.join('<br>') : 'Geen openingstijden bekend'
}

// Cleanup on unmount
onUnmounted(() => {
  // Stop location tracking
  stopLocationTracking()
  
  if (map) {
    map.remove()
    map = null
  }
})

const resetFilters = () => {
  filters.value = {
    openStatus: 'all',
    venueTypes: [],
    crowdLevelMin: 0,
    crowdLevelMax: 100
  }
  searchQuery.value = ''
  applyFilters()
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
        const venueTypeLower = v.type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        return filters.value.venueTypes.some(filterType => {
          const filterTypeLower = filterType.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          // Check for exact match or contains match
          return venueTypeLower === filterTypeLower || venueTypeLower.includes(filterTypeLower)
        })
      })
    }
    
    // Apply crowd level filter (percentage)
    if (filters.value.crowdLevelMin > 0 || filters.value.crowdLevelMax < 100) {
      filtered = filtered.filter(v => {
        const percentage = v.crowdLevelPercentage
        if (percentage === null || percentage === undefined) {
          return false // Filter out venues without crowd level data
        }
        return percentage >= filters.value.crowdLevelMin && percentage <= filters.value.crowdLevelMax
      })
    }
    
    filteredVenues.value = filtered
    
    // Update markers on map - wait a bit to ensure map is ready
    await nextTick()
    setTimeout(() => {
      addMarkersToMap()
    }, 100)
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

/* Location Controls */
.location-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.location-toggle {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #eaeaea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(31, 31, 31, 0.8);
  border: 1px solid #2a2a2a;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: #666;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .slider {
  background-color: #9b5cff;
  border-color: #8a4de6;
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(24px);
  background-color: #ffffff;
}

.toggle-switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-request-location {
  padding: 8px 16px;
  background: #9b5cff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.btn-request-location:hover {
  background: #8a4de6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
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
  font-size: 14px;
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

.id-initials {
  font-size: 48px;
  font-weight: 700;
  color: white;
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
</style>
