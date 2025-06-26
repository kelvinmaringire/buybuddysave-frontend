<template>
  <router-view />
</template>

<script setup>
import { useAuthStore } from './stores/auth-store'
import { useDealStore } from './stores/deal-store'
import { useBuddyStore } from './stores/buddy-store'

const authStore = useAuthStore()
const dealStore = useDealStore()
const buddyStore = useBuddyStore()

defineOptions({
  name: 'App'
})

// Ensure store initialization
async function initStore () {
  await authStore.initAuth()
  await authStore.fetchUsers()

  await dealStore.fetchStores()
  await dealStore.fetchDeals()
  await dealStore.fetchShoppingList()

  await buddyStore.fetchBuddyRequests()
  await buddyStore.fetchBuddies()
  await buddyStore.fetchReviewBuddies()
  await buddyStore.fetchNotifications()
  await buddyStore.fetchChatMessages()
}

// Call the initialization function
initStore()
</script>
