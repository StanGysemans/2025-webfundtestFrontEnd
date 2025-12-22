<template>
  <main class="content">
    <div class="chat-container">
      <div class="chat-header">
        <h2>Chat</h2>
        <p v-if="friendName">Met {{ friendName }}</p>
      </div>
      
      <div class="chat-messages">
        <div class="empty-chat">
          <p>Selecteer een vriend om te beginnen met chatten</p>
        </div>
      </div>
      
      <div class="chat-input-container">
        <input 
          type="text" 
          class="chat-input" 
          placeholder="Typ een bericht..." 
          v-model="message"
        />
        <button class="send-button">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const message = ref('')
const friendName = ref('')

onMounted(() => {
  // Get friend ID from query params
  const friendId = route.query.friendId
  if (friendId) {
    // TODO: Fetch friend name from API
    friendName.value = 'Vriend'
  }
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
  padding: 24px;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid #1f1f1f;
  border-radius: 16px 16px 0 0;
  border-bottom: none;
}

.chat-header h2 {
  font-size: 24px;
  color: #9b5cff;
  margin: 0 0 4px 0;
}

.chat-header p {
  color: #999;
  font-size: 14px;
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

.send-button:hover {
  background: #8a4de6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 92, 255, 0.3);
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

