<template>
  <q-page padding>
    <!-- Banner Header -->
    <q-banner dense inline-actions class="text-white bg-primary q-mb-md q-pa-sm rounded-borders">
      <div class="text-h6">Deals</div>
      <template v-slot:action>
        <q-btn
          dense
          flat
          round
          color="white"
          icon="search"
          @click="showSearchInput = !showSearchInput"
        />
      </template>
    </q-banner>

    <!-- Search Input Box -->
    <q-slide-transition>
      <div v-show="showSearchInput" class="q-mb-md">
        <form class="search-form">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search deals by title, description, store, or address"
            class="search-input"
          />
        </form>
      </div>
    </q-slide-transition>

    <!-- Category Filters -->
    <div class="q-mb-md q-gutter-sm">
      <q-btn-toggle
        v-model="selectedCategory"
        spread
        no-caps
        rounded
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          {label: 'All', value: 'all'},
          {label: 'Food', value: 'food', icon: 'restaurant'},
          {label: 'Drinks', value: 'drinks', icon: 'local_bar'},
          {label: 'Shopping', value: 'shopping', icon: 'shopping_bag'},
          {label: 'Services', value: 'services', icon: 'miscellaneous_services'}
        ]"
      />
    </div>

    <!-- Deal Cards -->
    <q-list bordered separator dense class="rounded-borders">
      <q-item
        v-for="deal in filteredDeals"
        :key="deal.id"
        clickable
        v-ripple
        :to="{ name: 'deal', params: { id: deal.id } }"
      >
        <q-card flat class="q-pa-xs full-width">
          <q-card-section horizontal class="q-gutter-sm items-start no-wrap">
            <q-img
              :src="deal.image_url"
              alt="Deal Image"
              style="width: 100px; height: 100px;"
              class="rounded-borders"
              spinner-color="grey-5"
            />
            <div class="col">
              <div class="text-subtitle1 text-dark">{{ deal.title }}</div>
              <div class="text-caption text-grey-8 ellipsis-2-lines">
                {{ deal.description }}
              </div>
              <q-chip
                v-if="deal.category"
                dense
                :color="getCategoryColor(deal.category)"
                text-color="white"
                class="q-mt-xs"
              >
                {{ formatCategory(deal.category) }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDealStore } from '../stores/deal-store'

const dealStore = useDealStore()

const selectedCategory = ref('all')
const showSearchInput = ref(false)
const searchQuery = ref('')

// Format category for display
const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// Get color based on category
const getCategoryColor = (category) => {
  const colors = {
    food: 'orange',
    drinks: 'blue',
    shopping: 'purple',
    services: 'teal'
  }
  return colors[category] || 'grey'
}

// Filter deals based on selected category and search query
const filteredDeals = computed(() => {
  let deals = dealStore.deals
  if (selectedCategory.value !== 'all') {
    deals = deals.filter(deal => deal.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    deals = deals.filter(deal =>
      deal.title?.toLowerCase().includes(query) ||
      deal.description?.toLowerCase().includes(query) ||
      deal.store_address?.toLowerCase().includes(query) ||
      deal.store_name?.toLowerCase().includes(query)
    )
  }
  return deals
})

</script>

<style scoped>
#place,
.styled-input,
.search-input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  outline: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

#place:focus,
.styled-input:focus,
.search-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 6px rgba(25, 118, 210, 0.5);
}

.search-input {
  background: transparent;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.q-list--dense > .q-item,
.q-item--dense {
  padding: 0;
}

.q-card__section--vert {
  padding: 5px;
}

/* Category chip styling */
.q-chip {
  font-size: 0.7rem;
  height: 20px;
}

/* Button group styling */
.q-btn-toggle {
  border: 1px solid #e0e0e0;
}

.q-btn-toggle .q-btn {
  margin: 0;
}
</style>
