<template>
  <q-pull-to-refresh icon="autorenew" @refresh="refresh">
    <router-view />
  </q-pull-to-refresh>
</template>

<script setup>
import { useAuthStore } from './stores/auth-store'
import { useDealStore } from './stores/deal-store'
import { useBuddyStore } from './stores/buddy-store'

const authStore = useAuthStore()
const dealStore = useDealStore()
const buddyStore = useBuddyStore()

defineOptions({
  name: 'App',
})

// Ensure store initialization
async function initStore() {
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

// Refresh function for pull-to-refresh
async function refresh(done) {
  try {
    await initStore()
    done()
  } catch (error) {
    console.error('Refresh failed:', error)
    done(false) // Indicate refresh failed
  }
}
</script>
