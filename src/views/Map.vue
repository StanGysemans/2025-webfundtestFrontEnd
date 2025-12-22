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
        />
        <button class="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </section>

    <!-- MAP -->
    <section class="map-section">
      <div class="map-container">
        <div class="map-placeholder">
          <p>Kaart wordt hier weergegeven</p>
          <p class="map-subtitle">Venues worden hier getoond op basis van filters</p>
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
import { ref } from 'vue'

const searchQuery = ref('')

const filters = ref({
  openStatus: 'all',
  venueTypes: [],
  crowdLevels: []
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

.map-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9b5cff;
  font-size: 24px;
  font-weight: 600;
}

.map-subtitle {
  margin-top: 12px;
  font-size: 16px;
  color: #999;
  font-weight: normal;
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
