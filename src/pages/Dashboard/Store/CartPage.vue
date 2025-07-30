<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Banner -->
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <div class="text-h6">Interested Deals</div>
      <template v-slot:action>
        <q-btn dense round flat icon="favorite" color="white">
          <q-badge color="red" floating rounded>
            {{ noRequestDealCount }}
          </q-badge>
        </q-btn>
      </template>
    </q-banner>

    <!-- Empty State -->
    <div v-if="sharedInterestDeals.length === 0" class="column items-center q-mt-xl">
      <q-icon name="swap_horiz" size="xl" color="grey-5" />
      <div class="text-h6 text-grey-5 q-mt-md">No buddy requests yet</div>
      <div class="text-caption text-grey q-mt-sm">
        When you are interested in a deal it will appear here
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
            <div class="text-caption text-blue-grey-6 q-mt-xs">
              {{ dealData.deal.store_address }} | {{ dealData.deal.distanceKm }} km
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
              <q-btn
                v-if="buttonState(dealData.deal.id, user.id) === 'noRequest'"
                unelevated
                color="primary"
                label="Request"
                dense
                @click="request(dealData.deal.id, user.id)"
              />
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

// State of the buddy request button
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

// Computed list of shared deals filtered by "noRequest" users
const sharedInterestDeals = computed(() => {
  const userId = authStore.userId
  const allDeals = dealStore.geoDeals
  const shoppingList = dealStore.shopping_list

  const shoppingCart = shoppingList.find((cart) => cart.user === userId)
  if (!shoppingCart || !shoppingCart.deals) return []

  const userDeals = shoppingCart.deals
  const sharedDeals = []

  userDeals.forEach((dealId) => {
    const interestedUsers = shoppingList
      .filter((cart) => cart.deals.includes(dealId) && cart.user !== userId)
      .map((cart) => cart.user)

    if (interestedUsers.length > 0) {
      sharedDeals.push({ deal: dealId, users: interestedUsers })
    }
  })

  return sharedDeals
    .map((sharedDeal) => {
      const deal = allDeals.find((d) => d.id === sharedDeal.deal)
      const users = sharedDeal.users
        .map((uid) => authStore.users.find((u) => u.id === uid))
        .filter((user) => buttonState.value(deal.id, user.id) === 'noRequest')

      return { deal, users }
    })
    .filter((dealData) => dealData.users.length > 0) // ✅ Remove deals with no "noRequest" users
})

// Count of users with no request
const noRequestDealCount = computed(() => {
  return sharedInterestDeals.value.reduce((count, dealData) => {
    return (
      count +
      dealData.users.filter((user) => buttonState.value(dealData.deal.id, user.id) === 'noRequest')
        .length
    )
  }, 0)
})

// Find current buddy request
function currentRequest(dealId, recipientId) {
  const requesterId = authStore.userId
  return buddyStore.buddy_requests.find(
    (request) =>
      request.deal === dealId &&
      ((request.requester === requesterId && request.recipient === recipientId) ||
        (request.requester === recipientId && request.recipient === requesterId)),
  )
}

// Send a buddy request
async function request(dealId, recipientId) {
  const requesterId = authStore.userId
  const buddyRequest = {
    requester: requesterId,
    recipient: recipientId,
    deal: dealId,
    status: 'Request',
  }

  try {
    await buddyStore.buddyRequest(buddyRequest)
    $q.notify({ type: 'primary', message: 'Buddy Requested', position: 'top' })
  } catch (err) {
    if (err.response?.data?.detail) {
      $q.notify({ type: 'negative', message: err.response.data.detail, position: 'top' })
    }
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

.q-btn {
  transition: all 0.2s ease;
}
.q-btn:active {
  transform: scale(0.96);
}

.q-card {
  border-radius: 12px;
  overflow: hidden;
}
.user-request-section {
  background-color: #fafafa;
  margin: 0 -16px;
  padding: 8px 16px;
}
.q-avatar {
  font-weight: 500;
}
.q-chip {
  padding: 4px 8px;
  font-size: 0.75rem;
}
.q-card-actions {
  border-top: 1px solid #e0e0e0;
  padding: 12px;
}
</style>
