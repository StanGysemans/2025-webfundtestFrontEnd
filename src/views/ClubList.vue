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
          <!-- Placeholder venues - Later vervangen door API data -->
          <div 
            v-for="venue in filteredVenues" 
            :key="venue.id" 
            class="venue-card"
          >
            <div class="venue-content">
              <!-- Venue Photo -->
              <div class="venue-photo">
                <img v-if="venue.image" :src="venue.image" :alt="venue.name" />
              </div>
              
              <div class="venue-info">
                <div class="venue-header">
                  <h3>{{ venue.name }}</h3>
                  <span class="venue-status" :class="venue.isOpen ? 'open' : 'closed'">
                    {{ venue.isOpen ? 'Open' : 'Gesloten' }}
                  </span>
                </div>
                
                <p class="venue-type">{{ venue.type }}</p>
                <p class="venue-description">{{ venue.description }}</p>
                
                <div class="venue-details">
                  <div class="venue-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{{ venue.location }}</span>
                  </div>
                  <div class="venue-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{{ venue.openingHours }}</span>
                  </div>
                  <div class="venue-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{{ venue.crowdLevel }}</span>
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
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const filters = ref({
  openStatus: 'all',
  venueTypes: [],
  crowdLevels: []
})

// Placeholder venues data - Later vervangen door API call
const venues = ref([
  {
    id: 1,
    name: 'Club Paradiso',
    type: 'Club',
    description: 'De beste dance muziek en sfeer in de stad',
    location: 'Amsterdam',
    openingHours: '22:00 - 05:00',
    isOpen: true,
    crowdLevel: 'Druk',
    image: null // Geen foto voor dit venue
  },
  {
    id: 2,
    name: 'Bar Central',
    type: 'Bar',
    description: 'Gezellige bar met live muziek',
    location: 'Utrecht',
    openingHours: '16:00 - 02:00',
    isOpen: true,
    crowdLevel: 'Gemiddeld',
    image: null // Geen foto voor dit venue
  },
  {
    id: 3,
    name: 'Restaurant Le Jardin',
    type: 'Restaurant',
    description: 'Frans restaurant met terras',
    location: 'Rotterdam',
    openingHours: '18:00 - 23:00',
    isOpen: false,
    crowdLevel: 'Rustig',
    image: null // Geen foto voor dit venue
  },
  {
    id: 4,
    name: 'Café de Nacht',
    type: 'Café',
    description: 'Hip café met goede koffie',
    location: 'Amsterdam',
    openingHours: '08:00 - 18:00',
    isOpen: true,
    crowdLevel: 'Rustig',
    image: null // Geen foto voor dit venue
  },
  {
    id: 5,
    name: 'Event Hall',
    type: 'Evenement',
    description: 'Grote evenementenhal voor concerten',
    location: 'Den Haag',
    openingHours: '19:00 - 01:00',
    isOpen: true,
    crowdLevel: 'Zeer Druk',
    image: null // Geen foto voor dit venue
  },
  {
    id: 6,
    name: 'Night Club X',
    type: 'Club',
    description: 'Underground club met techno',
    location: 'Amsterdam',
    openingHours: '23:00 - 06:00',
    isOpen: true,
    crowdLevel: 'Druk',
    image: null // Geen foto voor dit venue
  }
])

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

  // Filter op openingsstatus
  if (filters.value.openStatus === 'open') {
    result = result.filter(venue => venue.isOpen)
  } else if (filters.value.openStatus === 'closed') {
    result = result.filter(venue => !venue.isOpen)
  }

  // Filter op venue type
  if (filters.value.venueTypes.length > 0) {
    result = result.filter(venue => 
      filters.value.venueTypes.includes(venue.type.toLowerCase())
    )
  }

  // Filter op drukte
  if (filters.value.crowdLevels.length > 0) {
    const crowdMap = {
      'low': 'Rustig',
      'medium': 'Gemiddeld',
      'high': 'Druk',
      'very-high': 'Zeer Druk'
    }
    const crowdLevels = filters.value.crowdLevels.map(level => crowdMap[level])
    result = result.filter(venue => 
      crowdLevels.includes(venue.crowdLevel)
    )
  }

  return result
})

const resetFilters = () => {
  filters.value = {
    openStatus: 'all',
    venueTypes: [],
    crowdLevels: []
  }
  searchQuery.value = ''
}

const applyFilters = () => {
  // Placeholder: Later koppelen aan API
  console.log('Filters toepassen:', {
    search: searchQuery.value,
    filters: filters.value
  })
  // TODO: API call naar venues endpoint met filters
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
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 13px;
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
