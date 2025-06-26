<template>
  <q-page class="chat-page">
    <!-- Chat Header -->
    <q-banner dense inline-actions class="text-white bg-positive q-mb-md chat-header">
      <div class="text-h6">Chat</div>
      <template v-slot:action>
        <q-btn dense round flat icon="close" :to="{ name: 'buddy'}"></q-btn>
      </template>
    </q-banner>

    <!-- Chat Messages Container -->
    <div class="chat-content" ref="chatContainer">
      <div class="chat-messages">
        <q-chat-message
          v-for="text in chatLog"
          :key="text.id"
          :label="text.label"
          :name="text.name"
          :sent="text.sent"
          :stamp="text.stamp"
        >
          <div v-if="text.message">{{ text.message }}</div>
        </q-chat-message>

        <!-- Loading Indicator -->
        <q-chat-message name="Jane" v-if="isLoading">
          <q-spinner-dots size="2rem" />
        </q-chat-message>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="chat-input-container">
      <q-input filled dense v-model="message" @keyup.enter="sendMessage" color="positive" placeholder="Message" class="chat-input">
        <template v-slot:after>
          <q-btn round dense flat color="positive" icon="send" @click="sendMessage" />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth-store'
import { useBuddyStore } from '../../../stores/buddy-store'
// import { api } from '../../../boot/axios'

const authStore = useAuthStore()
const buddyStore = useBuddyStore()
const route = useRoute()
const router = useRouter()
const roomName = ref(route.params.id)
const message = ref('')
const isLoading = ref(false)
let chatSocket

const chatContainer = ref(null)

const scrollToBottom = () => {
  if (chatContainer.value) {
    // Adjust scroll position to account for the chat input container height
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight - chatContainer.value.clientHeight + 65
  }
}

const chatLog = computed(() => {
  return buddyStore.processedMessages(JSON.parse(roomName.value))
})

// WebSocket Setup
onMounted(async () => {
  await buddyStore.fetchChatMessages()

  const token = authStore.token.access

  console.log(token)

  // chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName.value}/?token=${token}`)

  chatSocket = new WebSocket(`wss://buybuddysave.co.za/ws/chat/${roomName.value}/?token=${token}`)

  chatSocket.onmessage = (e) => {
    const data = JSON.parse(e.data)
    buddyStore.addMessage(data)
    scrollToBottom()
  }

  chatSocket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  chatSocket.onclose = () => {
    console.error('Chat socket closed unexpectedly')
    router.push({ name: 'buddy' })
  }

  setTimeout(() => {
    scrollToBottom()
  }, 100)
})

onBeforeUnmount(() => {
  if (chatSocket) {
    chatSocket.close()
  }
})

const sendMessage = () => {
  if (message.value.trim() && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.send(JSON.stringify({ message: message.value, roomName: roomName.value, sender: authStore.userId }))

    message.value = ''
  } else {
    console.error('WebSocket is not open')
  }
}

watch(chatLog, () => {
  setTimeout(() => {
    scrollToBottom()
  }, 100) // Small delay to ensure DOM updates
})
</script>

<style scoped>
/* Chat Page Layout */
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
}

/* Chat Header (Stays at the Top) */
.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Chat Content (Scrollable Area) */
.chat-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 185px); /* Adjusted for header & input height */
  padding: 10px;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Messages Wrapper */
.chat-messages {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* Chat Input (Stays at the Bottom) */
.chat-input-container {
  position: sticky;
  bottom: 65px;
  background: white;
  padding: 10px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style>
