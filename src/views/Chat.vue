<template>
  <main class="content">
    <div class="chat-container">
      <div class="chat-header">
        <button class="back-button" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="header-info">
          <h2>Chat</h2>
          <p v-if="friendName">Met {{ friendName }}</p>
        </div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="loading" class="loading-state">
          <p>Berichten laden...</p>
        </div>
        <div v-else-if="messages.length === 0" class="empty-chat">
          <p>Nog geen berichten. Begin het gesprek!</p>
        </div>
        <template v-else>
          <div 
            v-for="(message, index) in messages" 
            :key="message.ChatMessageID"
            class="message-wrapper"
          >
            <!-- Date separator (show if different day than previous message) -->
            <div 
              v-if="shouldShowDateSeparator(message, index)" 
              class="date-separator"
            >
              <span>{{ formatDateSeparator(message.SentAt) }}</span>
            </div>
            
            <!-- Message bubble -->
            <div 
              class="message" 
              :class="{ 'own-message': message.SenderID === currentUserId }"
            >
              <div class="message-content">
                <p class="message-text">{{ message.MessageText }}</p>
                <span class="message-time">{{ formatTime(message.SentAt) }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <div class="chat-input-container">
        <input 
          type="text" 
          class="chat-input" 
          placeholder="Typ een bericht..." 
          v-model="message"
          @keyup.enter="sendMessage"
          :disabled="loading || !chatId"
        />
        <button 
          class="send-button" 
          @click="sendMessage"
          :disabled="loading || !message.trim() || !chatId"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatsService } from '@/services/chats.service.js'
import { usersService } from '@/services/users.service.js'
import { useAuth } from '@/composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const message = ref('')
const friendName = ref('')
const friendId = ref(null)
const chatId = ref(null)
const messages = ref([])
const loading = ref(false)
const currentUserId = ref(null)
const messagesContainer = ref(null)
let pollInterval = null

// Format time like Instagram (e.g., "14:30", "Gisteren 14:30", "15 jan 14:30")
const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const messageDate = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
  
  const hours = String(messageDate.getHours()).padStart(2, '0')
  const minutes = String(messageDate.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`
  
  if (messageDay.getTime() === today.getTime()) {
    // Today - just show time
    return time
  } else if (messageDay.getTime() === yesterday.getTime()) {
    // Yesterday
    return `Gisteren ${time}`
  } else {
    // Older - show date
    const day = messageDate.getDate()
    const monthNames = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
    const month = monthNames[messageDate.getMonth()]
    return `${day} ${month} ${time}`
  }
}

// Format date separator (e.g., "Vandaag", "Gisteren", "15 januari")
const formatDateSeparator = (dateString) => {
  if (!dateString) return ''
  
  const messageDate = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
  
  if (messageDay.getTime() === today.getTime()) {
    return 'Vandaag'
  } else if (messageDay.getTime() === yesterday.getTime()) {
    return 'Gisteren'
  } else {
    const day = messageDate.getDate()
    const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
    const month = monthNames[messageDate.getMonth()]
    return `${day} ${month}`
  }
}

// Check if we should show a date separator before this message
const shouldShowDateSeparator = (message, index) => {
  if (index === 0) return true
  
  const currentDate = new Date(message.SentAt)
  const previousDate = new Date(messages.value[index - 1].SentAt)
  
  const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
  const previousDay = new Date(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate())
  
  return currentDay.getTime() !== previousDay.getTime()
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Load or create chat
const initializeChat = async () => {
  if (!friendId.value || !currentUserId.value) return
  
  loading.value = true
  try {
    // Create or get chat
    const chat = await chatsService.createChat(friendId.value)
    chatId.value = chat.ChatID
    
    // Load messages
    await loadMessages()
    
    // Start polling for new messages
    startPolling()
  } catch (error) {
    console.error('Error initializing chat:', error)
    alert('Er is een fout opgetreden bij het laden van de chat')
  } finally {
    loading.value = false
  }
}

// Load messages
const loadMessages = async () => {
  if (!chatId.value) return
  
  try {
    const loadedMessages = await chatsService.getMessages(chatId.value)
    messages.value = loadedMessages
    scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
  }
}

// Send message
const sendMessage = async () => {
  if (!message.value.trim() || !chatId.value || loading.value) return
  
  const messageText = message.value.trim()
  message.value = ''
  
  try {
    await chatsService.sendMessage(chatId.value, messageText)
    // Reload messages to get the new one
    await loadMessages()
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Er is een fout opgetreden bij het versturen van het bericht')
    // Restore message text
    message.value = messageText
  }
}

// Poll for new messages
const startPolling = () => {
  if (pollInterval) clearInterval(pollInterval)
  
  pollInterval = setInterval(() => {
    if (chatId.value) {
      loadMessages()
    }
  }, 3000) // Poll every 3 seconds
}

// Stop polling
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// Go back to social tab
const goBack = () => {
  router.push('/social')
}

// Load friend name
const loadFriendName = async () => {
  if (!friendId.value) return
  
  try {
    const friendData = await usersService.getById(friendId.value)
    friendName.value = `${friendData.FirstName || ''} ${friendData.LastName || ''}`.trim() || 'Vriend'
  } catch (error) {
    console.error('Error loading friend name:', error)
    friendName.value = 'Vriend'
  }
}

onMounted(async () => {
  // Get friend ID from query params
  friendId.value = route.query.friendId ? parseInt(route.query.friendId) : null
  
  if (!friendId.value) {
    alert('Geen vriend geselecteerd')
    router.push('/social')
    return
  }
  
  // Get current user ID
  if (user.value && user.value.UserID) {
    currentUserId.value = user.value.UserID
  } else {
    // Try to get from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        currentUserId.value = parsed.UserID
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }
  
  if (!currentUserId.value) {
    alert('Je moet ingelogd zijn om te chatten')
    router.push('/social')
    return
  }
  
  // Load friend name
  await loadFriendName()
  
  // Initialize chat
  await initializeChat()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.content {
  flex: 1;
  padding: 32px;
  color: #eaeaea;
  background-color: #0f0f0f;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.chat-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.chat-header {
  padding: 16px 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 16px 16px 0 0;
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #9b5cff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(155, 92, 255, 0.1);
  transform: translateX(-2px);
}

.header-info {
  flex: 1;
}

.chat-header h2 {
  font-size: 20px;
  color: #9b5cff;
  margin: 0 0 4px 0;
}

.chat-header p {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.chat-messages {
  flex: 1;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-top: none;
  border-bottom: none;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.loading-state p {
  margin: 0;
  font-size: 14px;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.empty-chat p {
  margin: 0;
  font-size: 16px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-separator {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.date-separator span {
  padding: 6px 12px;
  background: rgba(155, 92, 255, 0.1);
  border-radius: 12px;
  color: #9b5cff;
  font-size: 12px;
  font-weight: 500;
}

.message {
  display: flex;
  max-width: 70%;
  align-self: flex-start;
}

.message.own-message {
  align-self: flex-end;
  margin-left: auto;
}

.message-content {
  background: rgba(31, 31, 31, 0.8);
  padding: 10px 14px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.own-message .message-content {
  background: rgba(155, 92, 255, 0.2);
  border: 1px solid rgba(155, 92, 255, 0.3);
}

.message-text {
  margin: 0;
  color: #eaeaea;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: #999;
  align-self: flex-end;
  margin-top: 2px;
}

.message.own-message .message-time {
  color: rgba(155, 92, 255, 0.8);
}

.chat-input-container {
  display: flex;
  gap: 12px;
  padding: 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 0 0 16px 16px;
  border-top: none;
}

.chat-input {
  flex: 1;
  padding: 14px 20px;
  background: rgba(15, 15, 15, 0.5);
  border: 1px solid #1f1f1f;
  border-radius: 12px;
  color: #eaeaea;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.chat-input:focus {
  border-color: #9b5cff;
  box-shadow: 0 0 0 3px rgba(155, 92, 255, 0.1);
}

.send-button {
  padding: 14px 20px;
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

.send-button:hover:not(:disabled) {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(15, 15, 15, 0.5);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(155, 92, 255, 0.3);
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 92, 255, 0.5);
}

.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 92, 255, 0.3) rgba(15, 15, 15, 0.5);
}
</style>

