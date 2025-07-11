<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Banner -->
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <div class="text-h6">Buddy Requests</div>
      <template v-slot:action>
        <q-btn dense round flat icon="swap_horiz" color="white">
          <q-badge color="red" floating rounded>
            {{ totalPendingRequests }}
          </q-badge>
        </q-btn>
      </template>
    </q-banner>

    <!-- Empty State -->
    <div v-if="sharedInterestDeals.length === 0" class="column items-center q-mt-xl">
      <q-icon name="swap_horiz" size="xl" color="grey-5" />
      <div class="text-h6 text-grey-5 q-mt-md">No buddy requests yet</div>
      <div class="text-caption text-grey q-mt-sm">
        When you and others save the same deals, requests will appear here
      </div>
    </div>

    <!-- Shared Deals List -->
    <div v-else>
      <q-card
        v-for="dealData in sharedInterestDeals"
        :key="dealData.deal.id"
        class="q-mb-md q-px-md q-pt-sm shadow-2"
        style="border-radius: 12px"
      >
        <!-- Deal Card -->
        <q-card-section horizontal class="items-start">
          <q-img
            :src="dealData.deal.image_url"
            style="width: 100px; height: 100px"
            class="rounded-borders"
          />

          <q-card-section class="q-pt-xs">
            <div class="text-subtitle1 text-weight-bold">{{ dealData.deal.title }}</div>
            <div class="text-caption text-grey-7 text-ellipsis-2-lines">
              {{ dealData.deal.description }}
            </div>
          </q-card-section>
        </q-card-section>

        <!-- User Requests -->
        <q-card-section
          v-for="user in dealData.users"
          :key="user.id"
          class="q-pt-none user-request-section"
        >
          <q-separator class="q-mb-sm" />
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-avatar size="32px" color="teal" text-color="white" class="q-mr-sm">
                {{ user.username.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="text-subtitle2 text-teal-10">@{{ user.username }}</div>
            </div>

            <div>
              <!-- Pending Requester State -->
              <q-chip
                v-if="buttonState(dealData.deal.id, user.id) === 'pendingRequester'"
                color="amber"
                text-color="dark"
                icon="hourglass_top"
                dense
              >
                Pending
              </q-chip>

              <!-- Pending Recipient State -->
              <q-btn-dropdown
                v-if="buttonState(dealData.deal.id, user.id) === 'pendingRecipient'"
                color="primary"
                label="Respond"
                dense
                dropdown-icon="expand_more"
              >
                <q-list dense>
                  <q-item clickable v-close-popup @click="acceptRequest(dealData.deal.id, user.id)">
                    <q-item-section avatar>
                      <q-icon name="check" color="positive" />
                    </q-item-section>
                    <q-item-section>Accept</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="declineRequest(dealData.deal.id, user.id)"
                  >
                    <q-item-section avatar>
                      <q-icon name="close" color="negative" />
                    </q-item-section>
                    <q-item-section>Decline</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>

              <!-- Accepted State -->
              <q-chip
                v-if="buttonState(dealData.deal.id, user.id) === 'accepted'"
                color="green-1"
                text-color="green-10"
                icon="check_circle"
                dense
              >
                Accepted
              </q-chip>

              <!-- Declined State -->
              <q-chip
                v-if="buttonState(dealData.deal.id, user.id) === 'declined'"
                color="red-1"
                text-color="red-10"
                icon="cancel"
                dense
              >
                Declined
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <!-- View Deal Button -->
        <q-card-actions class="justify-center bg-grey-1">
          <q-btn
            :to="{ name: 'deal', params: { id: dealData.deal.id } }"
            icon="visibility"
            label="View Deal"
            color="primary"
            flat
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useBuddyStore } from '../../../stores/buddy-store'
import { useDealStore } from '../../../stores/deal-store'
import { useAuthStore } from '../../../stores/auth-store'

const buddyStore = useBuddyStore()
const dealStore = useDealStore()
const authStore = useAuthStore()
const $q = useQuasar()

const sharedInterestDeals = computed(() => {
  const userId = authStore.userId
  const allDeals = dealStore.deals
  const shoppingList = dealStore.shopping_list // List of all users' deals

  // Find the user's shopping cart
  const shoppingCart = shoppingList.find((cart) => cart.user === userId)
  if (!shoppingCart || !shoppingCart.deals) return [] // Return empty if no shopping cart found

  const userDeals = shoppingCart.deals // Deals for the current user
  const sharedDeals = [] // Will store shared interest deals

  // Loop through user's deals
  userDeals.forEach((dealId) => {
    // Find other users who are also interested in the same deal
    const interestedUsers = shoppingList
      .filter((cart) => cart.deals.includes(dealId) && cart.user !== userId)
      .map((cart) => cart.user) // Extract the users

    if (interestedUsers.length > 0) {
      // Add to sharedDeals if there are other users interested
      sharedDeals.push({
        deal: dealId,
        users: interestedUsers,
      })
    }
  })

  const mappedSharedDeals = sharedDeals.map((sharedDeal) => {
    // Find the deal object by ID from allDeals
    const deal = allDeals.find((d) => d.id === sharedDeal.deal)

    // Map user IDs to actual user objects from authStore.users
    // const users = sharedDeal.users.map(userId => authStore.users.find(u => u.id === userId))
    const users = sharedDeal.users
      .map((userId) => authStore.users.find((u) => u.id === userId))
      .filter((user) => {
        const state = buttonState.value(deal.id, user.id)
        return state !== 'noRequest'
      })

    // Return the deal and its associated user objects
    return {
      deal,
      users,
    }
  })

  return mappedSharedDeals
})

const buttonState = computed(() => (dealId, userId) => {
  const request = currentRequest(dealId, userId)

  if (!request) {
    return 'noRequest'
  }

  const isRequester = request.requester === authStore.userId
  const isRecipient = request.recipient === authStore.userId

  if (request.status === 'Request' && isRequester) {
    return 'pendingRequester'
  }

  if (request.status === 'Request' && isRecipient) {
    return 'pendingRecipient'
  }

  if (request.status === 'Accepted') {
    return 'accepted'
  }

  if (request.status === 'Declined') {
    return 'declined'
  }
})

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

function currentRequest(dealId, recipientId) {
  const requesterId = authStore.userId

  const currentRequest = buddyStore.buddy_requests.find(
    (request) =>
      request.deal === dealId &&
      ((request.requester === requesterId && request.recipient === recipientId) ||
        (request.requester === recipientId && request.recipient === requesterId)),
  )

  return currentRequest
}
async function acceptRequest(dealId, userId) {
  try {
    const request = currentRequest(dealId, userId)
    request.status = 'Accepted'
    await buddyStore.acceptRequest(request)
    $q.notify({ type: 'positive', message: 'Request Accepted', position: 'top' })
  } catch (err) {
    console.log(err)
    $q.notify({ type: 'negative', message: 'Failed to accept request', position: 'top' })
  }
}

async function declineRequest(dealId, userId) {
  try {
    const request = currentRequest(dealId, userId)
    request.status = 'Declined'
    await buddyStore.declineRequest(request)
    $q.notify({ type: 'negative', message: 'Request Declined', position: 'top' })
  } catch (err) {
    console.log(err)
    $q.notify({ type: 'negative', message: 'Failed to decline request', position: 'top' })
  }
}
</script>

<style scoped>
.text-ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .text-subtitle1 {
    font-size: 1rem;
  }

  .text-subtitle2 {
    font-size: 0.875rem;
  }

  .q-btn {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}

/* Animation for buttons */
.q-btn {
  transition: all 0.2s ease;
}

.q-btn:active {
  transform: scale(0.96);
}

/* Card styling */
.q-card {
  border-radius: 12px;
  overflow: hidden;
}

/* User request section */
.user-request-section {
  background-color: #fafafa;
  margin: 0 -16px;
  padding: 8px 16px;
}

/* Avatar styling */
.q-avatar {
  font-weight: 500;
}

/* Chip styling */
.q-chip {
  padding: 4px 8px;
  font-size: 0.75rem;
}

/* View deal button section */
.q-card-actions {
  border-top: 1px solid #e0e0e0;
  padding: 12px;
}
</style>
