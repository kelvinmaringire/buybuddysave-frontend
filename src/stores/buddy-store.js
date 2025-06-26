import { defineStore } from 'pinia'
import { api } from '../boot/axios.js'
import { useAuthStore } from './auth-store.js'

export const useBuddyStore = defineStore('buddy', {
  state: () => ({
    buddy_requests: [],
    buddies: [],
    review_buddies: [],
    notifications: [],
    messages: []

  }),

  getters: {
    processedMessages: (state) => (buddy) => {
      const groupedMessages = []
      let currentDate = ''

      const authStore = useAuthStore()
      const userId = authStore.userId

      // Helper function to get the suffix for the day
      function getDaySuffix (day) {
        if (day >= 11 && day <= 13) {
          return 'th'
        }
        switch (day % 10) {
          case 1:
            return 'st'
          case 2:
            return 'nd'
          case 3:
            return 'rd'
          default:
            return 'th'
        }
      }

      // Filter messages by buddy
      const filteredMessages = state.messages.filter((message) => message.buddy === buddy)

      filteredMessages.forEach((message) => {
        // Format the date with weekday, short month, day, and suffix
        const messageDate = new Date(message.timestamp).toLocaleDateString('en-US', {
          weekday: 'long', // Full weekday name (e.g., "Sunday")
          month: 'short', // Short month name (e.g., "Feb")
          day: 'numeric' // Day of the month (e.g., "19")
        })

        // Add the suffix to the day
        const day = new Date(message.timestamp).getDate()
        const suffix = getDaySuffix(day)
        const formattedDate = messageDate.replace(/\d+/, `${day}${suffix}`)

        // Add a label for the date if it's a new date
        if (formattedDate !== currentDate) {
          groupedMessages.push({
            label: formattedDate,
            id: groupedMessages.length + 1
          })
          currentDate = formattedDate
        }

        // Format the message object
        const formattedMessage = {
          id: message.id,
          name: message.name,
          buddy: message.buddy,
          sender: message.sender,
          message: message.message,
          stamp: new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          sent: message.sender === userId
        }

        groupedMessages.push(formattedMessage)
      })

      return groupedMessages
    },
    unreadMessagesCount: (state) => (buddyId, currentUserId) => {
      return state.messages.filter(
        m => m.buddy === buddyId &&
         m.sender !== currentUserId &&
         !m.read
      ).length
    }

  },

  actions: {
    async fetchBuddyRequests () {
      const response = await api.get('buddy_requests/')
      this.buddy_requests = response.data
    },
    async fetchBuddies () {
      const response = await api.get('buddy_requests/buddy/')
      this.buddies = response.data
    },
    async fetchReviewBuddies () {
      const response = await api.get('buddy_requests/review/')
      this.review_buddies = response.data
    },
    async fetchNotifications () {
      const response = await api.get('buddy_requests/notification/')
      this.notifications = response.data
    },
    async fetchChatMessages () {
      const response = await api.get('chat/')
      this.messages = response.data
    },
    async buddyRequest (buddyRequest) {
      const response = await api.post('buddy_requests/', buddyRequest)
      this.buddy_requests.push(response.data)
    },
    async acceptRequest (buddyRequest) {
      console.log(buddyRequest)
      const response = await api.put(`buddy_requests/${buddyRequest.id}/`, buddyRequest)
      const index = this.buddy_requests.indexOf(buddyRequest)
      this.buddy_requests[index] = response.data
      delete buddyRequest.id
      delete buddyRequest.status
      delete buddyRequest.created_at
      this.createBuddy(buddyRequest)
    },
    async declineRequest (buddyRequest) {
      const response = await api.put(`buddy_requests/${buddyRequest.id}/`, buddyRequest)
      const index = this.buddy_requests.indexOf(buddyRequest)
      this.buddy_requests[index] = response.data
    },
    async createBuddy (buddies) {
      const response = await api.post('buddy_requests/buddy/', buddies)
      this.buddies.push(response.data)
    },
    addMessage (message) {
      this.messages.push(message)
    }

  }
})
