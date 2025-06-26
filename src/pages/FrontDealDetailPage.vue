<template>
  <q-page padding>
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md">
      <q-btn size="lg" flat dense color="white" icon="keyboard_backspace" :to="{ name: 'deals' }" />
      <template v-slot:action>
        <div class="text-h6" v-if="deal">{{ deal.title }}</div>
      </template>
    </q-banner>

    <q-card class="my-card" flat bordered v-if="deal">
    <q-img :src="deal.image_url" style="max-height: 300px; object-fit: cover;" />

      <q-card-section>

        <div class="row no-wrap items-center">
          <div class="col text-h6 ellipsis">
            {{ deal.title }}
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
              :to="{ name: 'login' }"
            />
            <div class="text-caption q-mt-xs text-center">Directions</div>
          </div>

          <!-- Wishlist Button -->
          <div class="column items-center q-px-sm">
            <q-btn round color="red" icon="favorite" size="md" v-if="!isInCart" :to="{ name: 'login' }" v-show="!cart"/>
            <div class="text-caption q-mt-xs text-center" v-if="!isInCart" v-show="!cart">Add to wishlist</div>
            <q-btn round color="red" icon="favorite" size="md" v-if="!isInCart" :to="{ name: 'login' }" v-show="cart"/>
            <div class="text-caption q-mt-xs text-center" v-if="!isInCart" v-show="cart">Add to wishlist</div>
            <q-btn round color="warning" icon="heart_broken" size="md" v-if="isInCart" @click="removeFromCart(cart.id, deal.id)"/>
            <div class="text-caption q-mt-xs text-center" v-if="isInCart">Remove listing</div>
          </div>

          <!-- Call Button -->
          <div class="column items-center q-px-sm">
            <q-btn
              round
              color="green"
              icon="call"
              size="md"
              :to="{ name: 'login' }"
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
import { useDealStore } from '../stores/deal-store'

// const stars = ref(4)

const dealStore = useDealStore()

const route = useRoute()

const store = computed(() => {
  if (!route.params.id || !dealStore.stores) {
    return null
  }

  const dealId = JSON.parse(route.params.id)
  const deals = dealStore.deals
  const deal = deals.find((deal) => deal.id === dealId)
  const stores = dealStore.stores
  const store = stores.find((store) => store.id === deal.store)

  return store || null
})

const deal = computed(() => {
  if (!route.params.id || !dealStore.deals) {
    return null
  }

  const dealId = JSON.parse(route.params.id)
  const deals = dealStore.deals
  const deal = deals.find((deal) => deal.id === dealId)

  return deal || null
})

// Fetch deals on component mount
onMounted(async () => {
  await dealStore.fetchDeals()
})
</script>
