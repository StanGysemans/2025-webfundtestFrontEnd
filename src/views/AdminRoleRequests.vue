<template>
  <main class="content">
    <div class="admin-container">
      <div class="admin-header">
        <h1>Role Requests Beheer</h1>
        <p>Beheer alle rol aanvragen van gebruikers</p>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: filterStatus === 'all' }"
          @click="filterStatus = 'all'"
        >
          Alle ({{ allRequests.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterStatus === 'pending' }"
          @click="filterStatus = 'pending'"
        >
          In behandeling ({{ pendingRequests.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterStatus === 'approved' }"
          @click="filterStatus = 'approved'"
        >
          Goedgekeurd ({{ approvedRequests.length }})
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: filterStatus === 'rejected' }"
          @click="filterStatus = 'rejected'"
        >
          Afgewezen ({{ rejectedRequests.length }})
        </button>
      </div>

      <!-- Requests List -->
      <div class="requests-list">
        <div 
          v-for="request in filteredRequests" 
          :key="request.RoleRequestID"
          class="request-card"
        >
          <div class="request-header">
            <div class="request-user-info">
              <div class="user-avatar">
                <span>{{ getUserInitials(request.user) }}</span>
              </div>
              <div class="user-details">
                <h3>{{ getUserName(request.user) }}</h3>
                <p class="user-email">{{ getUserEmail(request.user) }}</p>
              </div>
            </div>
            <span class="request-status" :class="request.Status">
              {{ getStatusLabel(request.Status) }}
            </span>
          </div>

          <div class="request-body">
            <div class="request-info">
              <div class="info-item">
                <span class="info-label">Gevraagde Rol:</span>
                <span class="info-value role-badge" :class="request.RequestedRole.toLowerCase()">
                  {{ getRoleLabel(request.RequestedRole) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Aanvraagdatum:</span>
                <span class="info-value">{{ formatDate(request.CreatedAt) }}</span>
              </div>
              <div v-if="request.ReviewedAt" class="info-item">
                <span class="info-label">Beoordeeld op:</span>
                <span class="info-value">{{ formatDate(request.ReviewedAt) }}</span>
              </div>
            </div>

            <div v-if="request.Message" class="request-message">
              <span class="message-label">Bericht:</span>
              <p>{{ request.Message }}</p>
            </div>

            <div v-if="request.Status === 'pending'" class="request-actions">
              <button 
                class="btn-approve" 
                @click="handleStatusChange(request.RoleRequestID, 'approved')"
                :disabled="processingRequest === request.RoleRequestID"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Goedkeuren
              </button>
              <button 
                class="btn-reject" 
                @click="handleStatusChange(request.RoleRequestID, 'rejected')"
                :disabled="processingRequest === request.RoleRequestID"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Afwijzen
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredRequests.length === 0" class="empty-state">
          <p>Geen aanvragen gevonden</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { roleRequestsService } from '@/services/rolerequests.service.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { isAuthenticated, user } = useAuth()

// Check if user is admin
const isAdmin = computed(() => {
  const role = user.value?.Role || ''
  return role === 'Admin' || role === 'admin'
})

// Redirect if not admin
onMounted(() => {
  if (!isAuthenticated.value || !isAdmin.value) {
    router.push('/profile')
  }
})

const allRequests = ref([])
const filterStatus = ref('all')
const processingRequest = ref(null)

const pendingRequests = computed(() => 
  allRequests.value.filter(r => r.Status === 'pending')
)

const approvedRequests = computed(() => 
  allRequests.value.filter(r => r.Status === 'approved')
)

const rejectedRequests = computed(() => 
  allRequests.value.filter(r => r.Status === 'rejected')
)

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') {
    return allRequests.value
  }
  return allRequests.value.filter(r => r.Status === filterStatus.value)
})

const fetchRequests = async () => {
  try {
    allRequests.value = await roleRequestsService.getAll()
  } catch (error) {
    console.error('Error fetching role requests:', error)
  }
}

const handleStatusChange = async (requestId, status) => {
  if (!confirm(`Weet je zeker dat je deze aanvraag wilt ${status === 'approved' ? 'goedkeuren' : 'afwijzen'}?`)) {
    return
  }

  processingRequest.value = requestId
  try {
    await roleRequestsService.updateStatus(requestId, status)
    await fetchRequests() // Refresh list
  } catch (error) {
    console.error('Error updating request status:', error)
    alert('Er is een fout opgetreden bij het bijwerken van de aanvraag')
  } finally {
    processingRequest.value = null
  }
}

const getUserName = (user) => {
  if (!user) return 'Onbekend'
  return `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'Onbekend'
}

const getUserInitials = (user) => {
  if (!user) return '??'
  const firstName = user.FirstName || ''
  const lastName = user.LastName || ''
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  return '??'
}

const getUserEmail = (user) => {
  if (!user) return 'Geen email'
  if (user.usercontact && user.usercontact.length > 0) {
    return user.usercontact[0].Email || 'Geen email'
  }
  return 'Geen email'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'In behandeling',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen'
  }
  return labels[status] || status
}

const getRoleLabel = (role) => {
  const labels = {
    venue_owner: 'Venue Owner',
    admin: 'Website Admin'
  }
  return labels[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  if (isAuthenticated.value && isAdmin.value) {
    fetchRequests()
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
  justify-content: center;
}

.admin-container {
  width: 100%;
  max-width: 1200px;
}

.admin-header {
  margin-bottom: 32px;
}

.admin-header h1 {
  font-size: 42px;
  color: #9b5cff;
  margin: 0 0 8px 0;
}

.admin-header p {
  color: #999;
  font-size: 16px;
  margin: 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 1px solid #1f1f1f;
}

.tab-btn {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #999;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #eaeaea;
}

.tab-btn.active {
  color: #9b5cff;
  border-bottom-color: #9b5cff;
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-card {
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(6px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #1f1f1f;
}

.request-user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9b5cff 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.user-details h3 {
  font-size: 18px;
  color: #eaeaea;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.request-status {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.request-status.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.request-status.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.request-status.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.request-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 14px;
  color: #999;
  min-width: 120px;
}

.info-value {
  font-size: 14px;
  color: #eaeaea;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.venue_owner {
  background: rgba(155, 92, 255, 0.2);
  color: #9b5cff;
  border: 1px solid rgba(155, 92, 255, 0.3);
}

.role-badge.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.request-message {
  background: rgba(15, 15, 15, 0.5);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #1f1f1f;
}

.message-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}

.request-message p {
  margin: 0;
  color: #eaeaea;
  font-size: 14px;
  line-height: 1.6;
}

.request-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-approve {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
  transform: translateY(-2px);
}

.btn-reject {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>

