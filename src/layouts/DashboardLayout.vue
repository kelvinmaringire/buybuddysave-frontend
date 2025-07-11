<template>
  <q-layout view="hhh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer Navigation -->
    <q-footer class="bg-primary text-white">
      <q-toolbar class="justify-center">
        <q-tabs dense no-caps justify="center" class="text-white q-pb-xs">
          <!-- Deals Tab -->
          <q-route-tab :to="{ name: 'dashboard' }" class="relative-position">
            <div class="column items-center justify-center q-pa-xs">
              <div class="relative-position">
                <q-icon name="home" size="24px" />
              </div>
              <span class="text-caption">Deals</span>
            </div>
          </q-route-tab>

          <!-- Wishlist Tab -->
          <q-route-tab :to="{ name: 'cart' }" class="relative-position">
            <div class="column items-center justify-center q-pa-xs">
              <div class="relative-position">
                <q-icon name="favorite" size="24px" />
                <q-badge
                  v-if="noRequestDealCount > 0"
                  color="red"
                  rounded
                  floating
                  class="badge-float"
                >
                  {{ noRequestDealCount }}
                </q-badge>
              </div>
              <span class="text-caption">Wish</span>
            </div>
          </q-route-tab>

          <!-- Buddy Requests Tab -->
          <q-route-tab :to="{ name: 'requests' }" class="relative-position">
            <div class="column items-center justify-center q-pa-xs">
              <div class="relative-position">
                <q-icon name="person_add_alt" size="24px" />
                <q-badge
                  v-if="totalPendingRequests > 0"
                  color="red"
                  rounded
                  floating
                  class="badge-float"
                >
                  {{ totalPendingRequests }}
                </q-badge>
              </div>
              <span class="text-caption">Requests</span>
            </div>
          </q-route-tab>

          <!-- Buddy Chat Tab -->
          <q-route-tab :to="{ name: 'buddy' }" class="relative-position">
            <div class="column items-center justify-center q-pa-xs">
              <div class="relative-position">
                <q-icon name="people" size="24px" />
                <q-badge
                  v-if="totalUnreadMessages > 0"
                  color="red"
                  rounded
                  floating
                  class="badge-float"
                >
                  {{ totalUnreadMessages }}
                </q-badge>
              </div>
              <span class="text-caption">Buddy</span>
            </div>
          </q-route-tab>

          <!-- Account Tab -->
          <q-route-tab :to="{ name: 'account' }" class="relative-position">
            <div class="column items-center justify-center q-pa-xs">
              <div class="relative-position">
                <q-icon name="account_circle" size="24px" />
              </div>
              <span class="text-caption">Account</span>
            </div>
          </q-route-tab>
        </q-tabs>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
/**
 * Imports
 */
import { computed } from 'vue'
import { useBuddyStore } from '../stores/buddy-store'
import { useDealStore } from '../stores/deal-store'
import { useAuthStore } from '../stores/auth-store'

/**
 * Stores
 */
const buddyStore = useBuddyStore()
const dealStore = useDealStore()
const authStore = useAuthStore()

/**
 * Helper: Get request between current user and other user for a specific deal
 */
function currentRequest(dealId, otherUserId) {
  const currentUserId = authStore.userId
  return buddyStore.buddy_requests.find(
    (request) =>
      request.deal === dealId &&
      ((request.requester === currentUserId && request.recipient === otherUserId) ||
        (request.requester === otherUserId && request.recipient === currentUserId)),
  )
}

/**
 * Helper: Get buddy relationship ID for a specific deal and user pair
 */
function getBuddyId(dealId, userId) {
  const request = currentRequest(dealId, userId)
  if (!request) return null

  const buddy = buddyStore.buddies.find(
    (b) =>
      b.deal === dealId &&
      ((b.requester === request.requester && b.recipient === request.recipient) ||
        (b.requester === request.recipient && b.recipient === request.requester)),
  )

  return buddy?.id || null
}

/**
 * Button state (per deal/user pair): pending, accepted, etc.
 */
const buttonState = computed(() => (dealId, userId) => {
  const request = currentRequest(dealId, userId)
  if (!request) return 'noRequest'

  const isRequester = request.requester === authStore.userId
  const isRecipient = request.recipient === authStore.userId

  if (request.status === 'Request' && isRequester) return 'pendingRequester'
  if (request.status === 'Request' && isRecipient) return 'pendingRecipient'
  if (request.status === 'Accepted') return 'accepted'
  if (request.status === 'Declined') return 'declined'
})

/**
 * Shared Interest Deals (all deals with mutual interest)
 */
const sharedInterestDeals = computed(() => {
  const userId = authStore.userId
  const allDeals = dealStore.geoDeals
  const shoppingList = dealStore.shopping_list

  const myCart = shoppingList.find((cart) => cart.user === userId)
  if (!myCart || !myCart.deals) return []

  const sharedDeals = myCart.deals
    .map((dealId) => {
      const deal = allDeals.find((d) => d.id === dealId)
      const users = shoppingList
        .filter((cart) => cart.deals.includes(dealId) && cart.user !== userId)
        .map((cart) => authStore.users.find((u) => u.id === cart.user))
        .filter(Boolean)

      return { deal, users }
    })
    .filter((dealData) => dealData.users.length > 0)

  return sharedDeals
})

/**
 * Wishlist count: Deals with mutual interest but no request sent yet
 */
const noRequestDealCount = computed(() => {
  let count = 0
  sharedInterestDeals.value.forEach((dealData) => {
    dealData.users.forEach((user) => {
      if (buttonState.value(dealData.deal.id, user.id) === 'noRequest') {
        count++
      }
    })
  })
  return count
})

/**
 * Pending requests count: Either sent or received but not yet accepted/declined
 */
const totalPendingRequests = computed(() => {
  let count = 0
  sharedInterestDeals.value.forEach((dealData) => {
    dealData.users.forEach((user) => {
      const state = buttonState.value(dealData.deal.id, user.id)
      if (state === 'pendingRequester' || state === 'pendingRecipient') {
        count++
      }
    })
  })
  return count
})

/**
 * Shared Accepted Deals (only accepted buddy requests)
 */
const sharedAcceptedDeals = computed(() => {
  const userId = authStore.userId
  const allDeals = dealStore.deals
  const shoppingList = dealStore.shopping_list

  const myCart = shoppingList.find((cart) => cart.user === userId)
  if (!myCart || !myCart.deals) return []

  const sharedDeals = myCart.deals
    .map((dealId) => {
      const deal = allDeals.find((d) => d.id === dealId)
      const users = shoppingList
        .filter((cart) => cart.deals.includes(dealId) && cart.user !== userId)
        .map((cart) => authStore.users.find((u) => u.id === cart.user))
        .filter((user) => {
          const req = currentRequest(dealId, user.id)
          return req && req.status === 'Accepted'
        })

      return { deal, users }
    })
    .filter((dealData) => dealData.users.length > 0)

  return sharedDeals
})

/**
 * Total unread messages count across all accepted buddies
 */
const totalUnreadMessages = computed(() => {
  const userId = authStore.userId
  if (!userId) return 0

  let total = 0
  sharedAcceptedDeals.value.forEach((dealData) => {
    dealData.users.forEach((user) => {
      const buddyId = getBuddyId(dealData.deal.id, user.id)
      if (buddyId) {
        total += buddyStore.unreadMessagesCount(buddyId, userId)
      }
    })
  })
  return total
})
</script>

<style scoped>
/* Position floating badge correctly on tab icon */
.badge-float {
  position: absolute;
  top: -4px;
  right: -4px;
  transform: scale(0.8);
  z-index: 1;
}
</style>
