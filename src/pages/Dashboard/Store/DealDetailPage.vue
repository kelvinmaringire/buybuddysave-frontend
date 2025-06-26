<template>
  <q-page padding>
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <q-btn size="lg" flat dense color="white" icon="keyboard_backspace" @click="$router.go(-1)" />
      <template v-slot:action>
        <div class="text-h6" v-if="deal">{{ deal.title }}</div>
      </template>
    </q-banner>

    <q-card class="my-card" flat bordered v-if="deal">
    <q-img :src="deal.image_url" style="max-height: 300px; object-fit: cover;" />

      <q-card-section>
        <q-btn
          fab
          color="primary"
          icon="place"
          class="absolute"
          style="top: 0; right: 12px; transform: translateY(-50%);"
        />

        <div class="row no-wrap items-center">
          <div class="col text-h6 ellipsis">
            {{ deal.title }}
          </div>
          <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
            <q-icon name="place" size="25px" />
            {{ deal.distanceKm }} km
          </div>
        </div>
      </q-card-section>

      <q-card-actions>
        <div class="row justify-around q-pa-md full-width">
          <!-- Directions Button -->
          <div class="column items-center q-px-sm">
            <q-btn
              round
              color="primary"
              icon="directions"
              size="md"
              @click="openDirections"
            />
            <div class="text-caption q-mt-xs text-center">Directions</div>
          </div>

          <!-- Wishlist Button -->
          <div class="column items-center q-px-sm">
            <q-btn round color="red" icon="favorite" size="md" v-if="!isInCart" @click="createAddToCart(deal.id)"  v-show="!cart"/>
            <div class="text-caption q-mt-xs text-center" v-if="!isInCart" @click="createAddToCart(deal.id)"  v-show="!cart">Add to wishlist</div>
            <q-btn round color="red" icon="favorite" size="md" v-if="!isInCart" @click="addToCart(cart.id, deal.id)" v-show="cart"/>
            <div class="text-caption q-mt-xs text-center" v-if="!isInCart" @click="addToCart(cart.id, deal.id)" v-show="cart">Add to wishlist</div>
            <q-btn round color="warning" icon="heart_broken" size="md" v-if="isInCart" @click="removeFromCart(cart.id, deal.id)"/>
            <div class="text-caption q-mt-xs text-center" v-if="isInCart" @click="removeFromCart(cart.id, deal.id)">Remove listing</div>
          </div>

          <!-- Call Button -->
          <div class="column items-center q-px-sm">
            <q-btn
              round
              color="green"
              icon="call"
              size="md"
              @click="callStore"
              :disable="!deal?.store_phone_number"
            />
            <div class="text-caption q-mt-xs text-center">Call</div>
          </div>

          <!-- Rate Button -->
          <!--div class="column items-center q-px-sm">
            <q-btn
              round
              color="amber"
              icon="star_rate"
              size="md"
              @click="rateDeal"
            />
            <div class="text-caption q-mt-xs text-center">Rate Now</div>
          </div-->
        </div>
      </q-card-actions>

      <q-card-section class="q-pt-none">
        <div class="text-subtitle1">
          {{ store.name }}
        </div>
        <div class="text-caption text-grey">
          {{ deal.description }}
        </div>
          <!--q-rating v-model="stars" :max="5" size="32px" /-->
      </q-card-section>

      <q-separator />

      <q-card-section>
        {{ deal.terms_and_conditions }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDealStore } from '../../../stores/deal-store'
import { useAuthStore } from '../../../stores/auth-store'

// const stars = ref(0)

const $q = useQuasar()

const dealStore = useDealStore()
const authStore = useAuthStore()

const route = useRoute()

onMounted(async () => {
  await dealStore.fetchDeals()
})

const geoDeal = computed(() => {
  if (!route.params.id || !dealStore.geoDeals) {
    return null
  }

  const dealId = JSON.parse(route.params.id)
  return dealStore.geoDeals.find((d) => d.id === dealId) || null
})

const store = computed(() => {
  return geoDeal.value && geoDeal.value.store_name
    ? {
        name: geoDeal.value.store_name,
        address: geoDeal.value.store_address,
        phone_number: geoDeal.value.store_phone_number,
        website: geoDeal.value.store_website
      }
    : null
})

const deal = geoDeal // alias to match your existing template bindings

const cart = computed(() => {
  if (!route.params.id || !dealStore.shopping_list) {
    return null
  }
  const userId = authStore.userId
  return dealStore.shopping_list.find((cart) => cart.user === userId) || null
})

const isInCart = computed(() => {
  return cart.value && deal.value && cart.value.deals.includes(deal.value.id)
})

async function createAddToCart (dealId) {
  try {
    await dealStore.createShoppingList({ user: authStore.userId, deals: [dealId] })

    $q.notify({
      type: 'positive',
      message: 'Added to cart',
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.detail || 'Error adding to cart',
      position: 'top'
    })
  }
}

async function addToCart (shoppingCartId, dealId) {
  try {
    await dealStore.addToShoppingList(shoppingCartId, dealId)

    $q.notify({
      type: 'positive',
      message: 'Added to cart',
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.detail || 'Error adding to cart',
      position: 'top'
    })
  }
}

async function removeFromCart (shoppingCartId, dealId) {
  try {
    await dealStore.removeFromShoppingList(shoppingCartId, dealId)

    $q.notify({
      type: 'warning',
      message: 'Removed from cart',
      position: 'top'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.detail || 'Error removing from cart',
      position: 'top'
    })
  }
}

function openDirections () {
  // Check if store location data exists
  if (!deal.value.storeLocation.coordinates) {
    $q.notify({
      type: 'warning',
      message: 'Store location not available',
      position: 'top'
    })
    return
  }

  // Extract store coordinates from the nested structure
  const [storeLng, storeLat] = deal.value.storeLocation.coordinates

  // Open Google Maps with just the destination
  // Let Google Maps handle getting the user's current location
  const url = `https://www.google.com/maps/dir/?api=1&destination=${storeLat},${storeLng}&travelmode=driving`
  window.open(url, '_blank')
}

function callStore () {
  if (!deal.value?.store_phone_number) {
    $q.notify({ type: 'warning', message: 'No phone number available', position: 'top' })
    return
  }
  const telUrl = `tel:${deal.value.store_phone_number}`
  window.location.href = telUrl
}

</script>
