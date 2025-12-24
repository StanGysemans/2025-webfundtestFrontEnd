<template>
  <main class="content">
    <!-- SEARCH BAR -->
    <section class="search-section">
      <div class="search-container">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Zoek naar vrienden..." 
          v-model="searchQuery"
        />
        <button class="search-button" @click="searchUsers">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </section>

    <!-- SUGGESTED FRIENDS -->
    <section class="friends-section">
      <h2>Voorgestelde Vrienden</h2>
      <div class="friends-list horizontal">
        <div 
          v-for="suggested in filteredSuggestedFriends" 
          :key="suggested.id" 
          class="friend-card"
        >
          <div 
            class="friend-avatar"
            :style="{ background: `linear-gradient(135deg, ${suggested.avatarColor || '#9b5cff'} 0%, ${suggested.avatarColorDark || '#6d28d9'} 100%)` }"
          >
            <span>{{ suggested.initials }}</span>
          </div>
          <p class="friend-name">{{ suggested.name }}</p>
          <button class="btn-add-friend" @click="addFriend(suggested.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Toevoegen
          </button>
        </div>
      </div>
    </section>

    <!-- FRIENDS LIST -->
    <section class="friends-section">
      <h2>Mijn Vrienden</h2>
      <div class="friends-list horizontal">
        <div 
          v-for="friend in filteredFriends" 
          :key="friend.id" 
          class="friend-card interactive"
          @mouseenter="hoveredFriend = friend.id"
          @mouseleave="hoveredFriend = null"
        >
          <div 
            class="friend-avatar"
            :style="{ background: `linear-gradient(135deg, ${friend.avatarColor || '#9b5cff'} 0%, ${friend.avatarColorDark || '#6d28d9'} 100%)` }"
          >
            <span>{{ friend.initials }}</span>
          </div>
          <p class="friend-name">{{ friend.name }}</p>
          
          <!-- Hover Options -->
          <div class="friend-options" v-if="hoveredFriend === friend.id">
            <button class="btn-option btn-view-id" @click="viewFriendId(friend.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Bekijk ID
            </button>
            <button class="btn-option btn-chat" @click="openChat(friend.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat
            </button>
            <button class="btn-option btn-remove" @click="removeFriend(friend.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Verwijderen
            </button>
          </div>
          
          <!-- Default View (when not hovered) -->
          <div class="friend-status" v-else>
            <span class="status-dot" :class="friend.isOnline ? 'online' : 'offline'"></span>
            <span class="status-text">{{ friend.isOnline ? 'Online' : 'Offline' }}</span>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredFriends.length === 0" class="empty-state">
          <p>Geen vrienden gevonden</p>
        </div>
      </div>
    </section>

    <!-- PENDING FRIEND REQUESTS -->
    <section class="friends-section pending-requests-section">
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Vriend Verzoeken
        <span v-if="pendingRequests && pendingRequests.length > 0" class="badge-count">{{ pendingRequests.length }}</span>
      </h2>
      <div v-if="pendingRequests && pendingRequests.length > 0" class="friends-list horizontal">
        <div 
          v-for="request in pendingRequests" 
          :key="request.FriendID" 
          class="friend-card request-card"
        >
          <div 
            class="friend-avatar"
            :style="{ background: `linear-gradient(135deg, ${request.avatarColor || '#9b5cff'} 0%, ${request.avatarColorDark || '#6d28d9'} 100%)` }"
          >
            <span>{{ request.initials }}</span>
          </div>
          <p class="friend-name">{{ request.name }}</p>
          <div class="request-actions">
            <button class="btn-accept-icon" @click="acceptFriendRequest(request.FriendID)" title="Accepteren">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button class="btn-reject-icon" @click="rejectFriendRequest(request.FriendID)" title="Afwijzen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-requests">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 12px;">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
        </svg>
        <p>Geen openstaande vriend verzoeken</p>
      </div>
    </section>

    <!-- FRIEND ID CARD MODAL -->
    <div v-if="showFriendIdCard" class="modal-overlay" @click.self="showFriendIdCard = false">
      <div class="modal id-card-modal">
        <div class="modal-header">
          <h2>ID Kaart</h2>
          <button class="modal-close" @click="showFriendIdCard = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body id-card-body-content">
          <div v-if="selectedFriend" class="id-card-view">
            <div class="id-card-header-view">
              <h3>UitgaansFinder</h3>
              <span class="id-type-view">ID Kaart</span>
            </div>
            
            <div class="id-card-content">
              <div class="id-photo-view">
                <div 
                  class="id-photo-avatar" 
                  :style="{ background: `linear-gradient(135deg, ${selectedFriend.avatarColor || '#9b5cff'} 0%, ${selectedFriend.avatarColorDark || '#6d28d9'} 100%)` }"
                >
                  <span>{{ selectedFriend.initials }}</span>
                </div>
              </div>
              
              <div class="id-info-view">
                <div class="id-field-view">
                  <span class="id-label-view">Naam:</span>
                  <span class="id-value-view">{{ selectedFriend.firstName }} {{ selectedFriend.lastName }}</span>
                </div>
                <div class="id-field-view">
                  <span class="id-label-view">Leeftijd:</span>
                  <span class="id-value-view">{{ selectedFriend.age }} jaar</span>
                </div>
                <div class="id-field-view">
                  <span class="id-label-view">Stad:</span>
                  <span class="id-value-view">{{ selectedFriend.campusCity }}</span>
                </div>
                <div class="id-field-view">
                  <span class="id-label-view">Geslacht:</span>
                  <span class="id-value-view">{{ selectedFriend.gender }}</span>
                </div>
                <div class="id-field-view">
                  <span class="id-label-view">Bio:</span>
                  <span class="id-value-view">{{ selectedFriend.bio || 'Geen bio' }}</span>
                </div>
                <div class="id-field-view">
                  <span class="id-label-view">Rol:</span>
                  <span class="id-value-view role-badge-view" :class="(selectedFriend.role || 'User').toLowerCase()">
                    {{ selectedFriend.role || 'User' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { friendsService } from '@/services/friends.service.js'
import { usersService } from '@/services/users.service.js'

const router = useRouter()
const { isAuthenticated, user } = useAuth()
const searchQuery = ref('')
const hoveredFriend = ref(null)
const showFriendIdCard = ref(false)
const selectedFriend = ref(null)
const loading = ref(false)

// Suggested friends (users who are not yet friends)
const suggestedFriends = ref([])

// Friends data from API
const friends = ref([])

// Pending friend requests
const pendingRequests = ref([])

const filteredFriends = computed(() => {
  if (!searchQuery.value.trim()) {
    return friends.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return friends.value.filter(friend => 
    friend.name.toLowerCase().includes(query) ||
    friend.firstName?.toLowerCase().includes(query) ||
    friend.lastName?.toLowerCase().includes(query)
  )
})

const filteredSuggestedFriends = computed(() => {
  if (!searchQuery.value.trim()) {
    return suggestedFriends.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return suggestedFriends.value.filter(suggested => 
    suggested.name.toLowerCase().includes(query) ||
    suggested.firstName?.toLowerCase().includes(query) ||
    suggested.lastName?.toLowerCase().includes(query)
  )
})

// Fetch friends from API
const fetchFriends = async () => {
  if (!isAuthenticated.value) {
    friends.value = []
    suggestedFriends.value = []
    pendingRequests.value = []
    return
  }

  loading.value = true
  try {
    const friendsData = await friendsService.getAll()
    
    // Transform API response to our format
    friends.value = friendsData
      .filter(friend => friend.Status === 'accepted')
      .map(friend => {
        // Determine which user is the friend (not the current user)
        const friendUser = friend.user_friend_UserID1Touser.UserID === user.value.UserID
          ? friend.user_friend_UserID2Touser
          : friend.user_friend_UserID1Touser
        
        return {
          id: friendUser.UserID,
          UserID: friendUser.UserID,
          FriendID: friend.FriendID, // Store FriendID for deletion
          name: `${friendUser.FirstName || ''} ${friendUser.LastName || ''}`.trim(),
          firstName: friendUser.FirstName || '',
          lastName: friendUser.LastName || '',
          initials: `${(friendUser.FirstName || '')[0] || ''}${(friendUser.LastName || '')[0] || ''}`.toUpperCase(),
          isOnline: false, // TODO: Implement online status
          age: null, // Will be fetched when viewing ID card
          campusCity: '',
          gender: '',
          bio: '',
          role: '',
          avatarColor: friendUser.AvatarColor || '#9b5cff',
          avatarColorDark: friendUser.AvatarColorDark || '#6d28d9'
        }
      })
    
    // Fetch pending requests
    await fetchPendingRequests()
    
    // Fetch suggested friends (get all users, exclude current user and existing friends)
    await fetchSuggestedFriends()
  } catch (error) {
    console.error('Error fetching friends:', error)
    friends.value = []
  } finally {
    loading.value = false
  }
}

// Fetch pending friend requests
const fetchPendingRequests = async () => {
  if (!isAuthenticated.value) {
    pendingRequests.value = []
    return
  }

  try {
    const requests = await friendsService.getPendingRequests()
    console.log('Fetched pending requests:', requests)
    
    // Backend already filters: returns requests where current user is involved but NOT the requester
    // So all requests here are ones where current user is the recipient
    pendingRequests.value = requests
      .filter(request => request.Status === 'pending') // Extra safety check
      .map(request => {
        // Determine which user is the requester (the one who sent the request)
        // The requester is the one whose UserID matches RequestedBy
        const requester = request.user_friend_UserID1Touser.UserID === request.RequestedBy
          ? request.user_friend_UserID1Touser
          : request.user_friend_UserID2Touser
        
        // Fallback: if RequestedBy doesn't match either, use RequestedByTouser relation
        const finalRequester = requester || request.user_friend_RequestedByTouser || request.user_friend_UserID1Touser
        
        return {
          FriendID: request.FriendID,
          id: finalRequester.UserID,
          UserID: finalRequester.UserID,
          name: `${finalRequester.FirstName || ''} ${finalRequester.LastName || ''}`.trim() || 'Onbekend',
          firstName: finalRequester.FirstName || '',
          lastName: finalRequester.LastName || '',
          initials: `${(finalRequester.FirstName || '')[0] || ''}${(finalRequester.LastName || '')[0] || ''}`.toUpperCase() || '??',
          avatarColor: finalRequester.AvatarColor || '#9b5cff',
          avatarColorDark: finalRequester.AvatarColorDark || '#6d28d9'
        }
      })
    
    console.log('Processed pending requests:', pendingRequests.value)
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    console.error('Error details:', error.response?.data || error.message)
    pendingRequests.value = []
  }
}

// Fetch suggested friends
const fetchSuggestedFriends = async () => {
  if (!isAuthenticated.value) {
    suggestedFriends.value = []
    return
  }

  try {
    // Get all pending requests (both sent and received) to exclude
    const allPendingRequests = await friendsService.getPendingRequests()
    const friendIds = new Set([
      user.value.UserID,
      ...friends.value.map(f => f.id),
      ...pendingRequests.value.map(r => r.id),
      ...allPendingRequests.map(r => {
        const otherUser = r.user_friend_UserID1Touser.UserID === user.value.UserID
          ? r.user_friend_UserID2Touser.UserID
          : r.user_friend_UserID1Touser.UserID
        return otherUser
      })
    ])
    
    // Fetch all users from database
    const allUsers = await usersService.getAll()
    
    // Filter out current user, existing friends, and pending requests
    // Then randomly select up to 10 users
    const availableUsers = allUsers
      .filter(u => !friendIds.has(u.UserID))
      .map(u => ({
        id: u.UserID,
        UserID: u.UserID,
        name: `${u.FirstName || ''} ${u.LastName || ''}`.trim() || 'Onbekend',
        firstName: u.FirstName || '',
        lastName: u.LastName || '',
        initials: `${(u.FirstName || '')[0] || ''}${(u.LastName || '')[0] || ''}`.toUpperCase() || '??'
      }))
    
    // Randomly shuffle and take up to 10
    const shuffled = availableUsers.sort(() => 0.5 - Math.random())
    suggestedFriends.value = shuffled.slice(0, 10)
  } catch (error) {
    console.error('Error fetching suggested friends:', error)
    suggestedFriends.value = []
  }
}

const addFriend = async (friendId) => {
  try {
    await friendsService.createRequest(friendId)
    
    // Remove user from suggested friends list immediately
    suggestedFriends.value = suggestedFriends.value.filter(user => user.id !== friendId)
    
    await fetchFriends() // Refresh list (includes pending requests)
    // Note: We don't need to refetch suggested friends since we already removed the user
  } catch (error) {
    console.error('Error adding friend:', error)
    const errorMsg = error.response?.data?.error || error.message || 'Er is een fout opgetreden bij het toevoegen van de vriend'
    alert(errorMsg)
  }
}

const acceptFriendRequest = async (friendId) => {
  try {
    // Find the request by FriendID
    const request = pendingRequests.value.find(r => r.FriendID === friendId)
    if (request) {
      await friendsService.acceptRequest(request.FriendID)
      await fetchFriends() // Refresh list
    }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    alert('Er is een fout opgetreden bij het accepteren van het verzoek')
  }
}

const rejectFriendRequest = async (friendId) => {
  try {
    // Find the request by FriendID
    const request = pendingRequests.value.find(r => r.FriendID === friendId)
    if (request) {
      await friendsService.delete(request.FriendID)
      await fetchPendingRequests() // Refresh pending requests
    }
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    alert('Er is een fout opgetreden bij het afwijzen van het verzoek')
  }
}

const removeFriend = async (friendId) => {
  if (!confirm('Weet je zeker dat je deze vriend wilt verwijderen?')) {
    return
  }

  try {
    // Find the friend relationship ID
    const friendRelation = friends.value.find(f => f.id === friendId)
    if (friendRelation?.FriendID) {
      await friendsService.delete(friendRelation.FriendID)
      await fetchFriends() // Refresh list
    } else {
      // If we don't have FriendID, we need to find it from the API
      const allFriends = await friendsService.getAll()
      const relation = allFriends.find(f => {
        const otherUser = f.user_friend_UserID1Touser.UserID === user.value.UserID
          ? f.user_friend_UserID2Touser.UserID
          : f.user_friend_UserID1Touser.UserID
        return otherUser === friendId
      })
      if (relation) {
        await friendsService.delete(relation.FriendID)
        await fetchFriends() // Refresh list
      } else {
        alert('Vriend relatie niet gevonden')
      }
    }
  } catch (error) {
    console.error('Error removing friend:', error)
    alert('Er is een fout opgetreden bij het verwijderen van de vriend')
  }
}

const openChat = (friendId) => {
  // Navigate to chat page with friend ID
  router.push({ path: '/chat', query: { friendId } })
}

const viewFriendId = async (friendId) => {
  const friend = friends.value.find(f => f.id === friendId)
  if (friend) {
    try {
      // Fetch full user data for ID card
      const userData = await usersService.getById(friendId)
      const contact = userData.usercontact?.[0]
      
      selectedFriend.value = {
        ...friend,
        firstName: userData.FirstName || '',
        lastName: userData.LastName || '',
        age: userData.Age || null,
        campusCity: userData.CampusCity || '',
        gender: userData.Gender || '',
        bio: userData.Bio || '',
        role: userData.Role || 'User',
        Email: contact?.Email || '',
        avatarColor: userData.AvatarColor || '#9b5cff',
        avatarColorDark: userData.AvatarColorDark || '#6d28d9'
      }
      showFriendIdCard.value = true
    } catch (error) {
      console.error('Error fetching friend data:', error)
      // Fallback to basic friend data
      selectedFriend.value = friend
      showFriendIdCard.value = true
    }
  }
}

// Load friends on mount
onMounted(() => {
  if (isAuthenticated.value) {
    fetchFriends()
  }
})

// Search users in database
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    // If search is empty, show suggested friends
    await fetchSuggestedFriends()
    return
  }

  loading.value = true
  try {
    const searchResults = await usersService.getAll({ search: searchQuery.value })
    
    // Filter out current user, existing friends, and pending requests
    const pendingRequests = await friendsService.getPendingRequests()
    const friendIds = new Set([
      user.value.UserID,
      ...friends.value.map(f => f.id),
      ...pendingRequests.map(r => {
        const otherUser = r.user_friend_UserID1Touser.UserID === user.value.UserID
          ? r.user_friend_UserID2Touser.UserID
          : r.user_friend_UserID1Touser.UserID
        return otherUser
      })
    ])
    
    suggestedFriends.value = searchResults
      .filter(u => !friendIds.has(u.UserID))
      .map(u => ({
        id: u.UserID,
        UserID: u.UserID,
        name: `${u.FirstName || ''} ${u.LastName || ''}`.trim() || 'Onbekend',
        firstName: u.FirstName || '',
        lastName: u.LastName || '',
        initials: `${(u.FirstName || '')[0] || ''}${(u.LastName || '')[0] || ''}`.toUpperCase() || '??'
      }))
  } catch (error) {
    console.error('Error searching users:', error)
  } finally {
    loading.value = false
  }
}

// Watch for auth changes
watch(() => isAuthenticated.value, (newVal) => {
  if (newVal) {
    fetchFriends() // This also fetches pending requests
    fetchSuggestedFriends()
  } else {
    friends.value = []
    suggestedFriends.value = []
    pendingRequests.value = []
  }
})

// Watch search query and search when it changes
watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    searchUsers()
  } else {
    fetchSuggestedFriends()
  }
})
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
  overflow-x: hidden;
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

/* Friends Section */
.friends-section {
  width: 100%;
  max-width: 800px;
  margin-bottom: 48px;
}

.friends-section h2 {
  font-size: 32px;
  color: #9b5cff;
  margin-bottom: 24px;
}

.friends-list {
  display: flex;
  gap: 16px;
  width: 100%;
}

.friends-list.horizontal {
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 92, 255, 0.3) rgba(15, 15, 15, 0.5);
  /* Show max 4 cards at once: 4 cards (180px) + 3 gaps (16px) = 768px */
  max-width: 768px;
}

.friends-list.horizontal::-webkit-scrollbar {
  height: 8px;
}

.friends-list.horizontal::-webkit-scrollbar-track {
  background: rgba(15, 15, 15, 0.5);
  border-radius: 4px;
}

.friends-list.horizontal::-webkit-scrollbar-thumb {
  background: rgba(155, 92, 255, 0.3);
  border-radius: 4px;
}

.friends-list.horizontal::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 92, 255, 0.5);
}

/* Friend Card */
.friend-card {
  min-width: 180px;
  width: 180px;
  flex-shrink: 0;
  background: rgba(18, 18, 18, 0.85);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #1f1f1f;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.friend-card.interactive {
  cursor: pointer;
}

.friend-card.interactive:hover {
  border-color: #9b5cff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(155, 92, 255, 0.2);
}

.friend-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

.friend-name {
  font-size: 16px;
  font-weight: 600;
  color: #eaeaea;
  margin: 0;
  text-align: center;
}

/* Add Friend Button */
.btn-add-friend {
  width: 100%;
  padding: 10px 16px;
  background: #9b5cff;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-add-friend:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

/* Friend Status */
.friend-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.status-dot.offline {
  background: #666;
}

/* Friend Options (on hover) */
.friend-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-option {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-chat {
  background: #9b5cff;
  color: white;
}

.btn-chat:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

.btn-remove {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.request-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.btn-accept-icon,
.btn-reject-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-accept-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 2px solid rgba(34, 197, 94, 0.4);
}

.btn-accept-icon:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-reject-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.4);
}

.btn-reject-icon:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Empty State */
.empty-state {
  min-width: 100%;
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Pending Requests Section */
.pending-requests-section {
  border: 2px solid rgba(155, 92, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  background: rgba(155, 92, 255, 0.05);
  width: 100%;
  max-width: 100%;
  margin-top: 48px;
}

.pending-requests-section h2 {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.badge-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  margin-left: 12px;
  background: #9b5cff;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.request-card {
  border: 1px solid rgba(155, 92, 255, 0.3);
  background: rgba(155, 92, 255, 0.05);
}

.request-card:hover {
  border-color: rgba(155, 92, 255, 0.5);
  background: rgba(155, 92, 255, 0.1);
}

.empty-requests {
  text-align: center;
  padding: 48px 20px;
  color: #666;
}

.empty-requests p {
  margin: 0;
  font-size: 16px;
  color: #999;
}

/* ID CARD MODAL */
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

.id-card-modal {
  background: transparent;
  border: none;
  box-shadow: none;
  max-width: 600px;
}

.id-card-modal .modal-header {
  background: transparent;
  border: none;
  padding: 0;
  margin-bottom: 16px;
  position: relative;
}

.id-card-modal .modal-header h2 {
  display: none;
}

.id-card-modal .modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(18, 18, 18, 0.9);
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  padding: 8px;
}

.id-card-body-content {
  padding: 0;
}

.id-card-view {
  background: rgba(18, 18, 18, 0.95);
  border: 2px solid #1f1f1f;
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.id-card-header-view {
  background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.id-card-header-view h3 {
  font-size: 24px;
  color: white;
  margin: 0;
}

.id-type-view {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.id-card-content {
  padding: 32px;
  display: flex;
  gap: 32px;
}

.id-photo-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.id-photo-avatar {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.id-photo-avatar span {
  font-size: 36px;
  font-weight: 700;
  color: white;
}

.id-info-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.id-field-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.id-label-view {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.id-value-view {
  font-size: 16px;
  color: #eaeaea;
  font-weight: 500;
}

.role-badge-view {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
}

.role-badge-view.venueowner {
  background: rgba(155, 92, 255, 0.2);
  color: #9b5cff;
  border: 1px solid rgba(155, 92, 255, 0.3);
}

.role-badge-view.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.role-badge-view.user {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-view-id {
  background: #3b82f6;
  color: white;
}

.btn-view-id:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>
