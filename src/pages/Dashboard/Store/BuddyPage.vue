<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Banner -->
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <div class="text-h6">Buy Buddies</div>
      <template v-slot:action>
        <q-btn dense round flat icon="chat" color="white">
          <q-badge color="red" floating rounded>
            {{ totalUnreadMessages }}
          </q-badge>
        </q-btn>
      </template>
    </q-banner>

    <!-- Empty State -->
    <div v-if="sharedAcceptedDeals.length === 0" class="column items-center q-mt-xl">
      <q-icon name="people" size="xl" color="grey-5" />
      <div class="text-h6 text-grey-5 q-mt-md">No buy buddies yet</div>
      <div class="text-caption text-grey q-mt-sm">
        When you accept buddy requests, they will appear here
      </div>
    </div>

    <!-- Shared Deals List -->
    <div v-else>
      <q-card
        v-for="dealData in sharedAcceptedDeals"
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

        <!-- User Buddies -->
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
              <!-- Accepted State -->
              <q-btn
                v-if="buttonState(dealData.deal.id, user.id) === 'accepted'"
                push
                icon="chat"
                color="positive"
                text-color="white"
                class="q-pr-md q-btn-with-badge"
                :to="{ name: 'chat', params: { id: getBuddyId(dealData.deal.id, user.id) } }"
              >
                <div class="row items-center no-wrap">
                  <span class="q-ml-sm">Chat</span>
                </div>
                <q-badge
                  v-if="getUnreadCount(dealData.deal.id, user.id) > 0"
                  color="negative"
                  floating
                  class="badge-offset"
                >
                  {{ getUnreadCount(dealData.deal.id, user.id) }}
                </q-badge>
              </q-btn>
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
import { computed, onMounted } from 'vue'
import { useBuddyStore } from '../../../stores/buddy-store'
import { useDealStore } from '../../../stores/deal-store'
import { useAuthStore } from '../../../stores/auth-store'

const buddyStore = useBuddyStore()
const dealStore = useDealStore()
const authStore = useAuthStore()

onMounted(async () => {
  await buddyStore.fetchChatMessages()
})

// Only show deals with an accepted status
const sharedAcceptedDeals = computed(() => {
  const userId = authStore.userId
  const allDeals = dealStore.deals
  const shoppingList = dealStore.shopping_list

  const userCart = shoppingList.find((cart) => cart.user === userId)
  if (!userCart || !userCart.deals) return []

  const userDeals = userCart.deals
  const sharedDeals = []

  userDeals.forEach((dealId) => {
    const interestedUsers = shoppingList
      .filter((cart) => cart.deals.includes(dealId) && cart.user !== userId)
      .map((cart) => cart.user)

    if (interestedUsers.length > 0) {
      sharedDeals.push({
        deal: dealId,
        users: interestedUsers,
      })
    }
  })

  return sharedDeals
    .map((sharedDeal) => {
      const deal = allDeals.find((d) => d.id === sharedDeal.deal)
      const users = sharedDeal.users
        .map((userId) => authStore.users.find((u) => u.id === userId))
        .filter((user) => {
          const request = currentRequest(sharedDeal.deal, user.id)
          return request && request.status === 'Accepted'
        })
      return { deal, users }
    })
    .filter((dealData) => dealData.users.length > 0)
})

const buttonState = computed(() => (dealId, userId) => {
  const request = currentRequest(dealId, userId)
  if (!request) return 'noRequest'
  return request.status === 'Accepted' ? 'accepted' : 'declined'
})

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

function currentRequest(dealId, recipientId) {
  const requesterId = authStore.userId
  return buddyStore.buddy_requests.find(
    (request) =>
      request.deal === dealId &&
      ((request.requester === requesterId && request.recipient === recipientId) ||
        (request.requester === recipientId && request.recipient === requesterId)),
  )
}

function getBuddyId(dealId, userId) {
  const buddies = buddyStore.buddies
  const request = currentRequest(dealId, userId)

  if (!request) {
    return null
  }

  const buddy = buddies.find(
    (b) =>
      b.deal === dealId &&
      ((b.requester === request.requester && b.recipient === request.recipient) ||
        (b.requester === request.recipient && b.recipient === request.requester)),
  )

  return buddy ? buddy.id : null
}

function getUnreadCount(dealId, userId) {
  const buddyId = getBuddyId(dealId, userId)
  if (!buddyId || !authStore.userId) return 0
  return buddyStore.unreadMessagesCount(buddyId, authStore.userId)
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

.q-btn-with-badge {
  position: relative;
  padding-right: 2.5em; /* Adjust this to make space for the badge */
}

.badge-offset {
  position: absolute;
  top: 2px;
  right: 2px;
}
</style>
