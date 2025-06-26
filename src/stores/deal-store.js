import { defineStore } from 'pinia'
import { api } from '../boot/axios.js'
import { useAuthStore } from './auth-store.js'
import { getDistance } from 'geolib'

export const useDealStore = defineStore('deal', {
  state: () => ({
    stores: [],
    deals: [],
    shopping_list: [],
    lastLocationUpdate: null

  }),

  getters: {
    geoDeals (state) {
      const authStore = useAuthStore()
      const stores = state.stores
      const deals = state.deals
      const user = authStore.profile

      // First map the deals with distance calculation
      const dealsWithDistance = deals.map(deal => {
        const store = stores.find(s => s.id === deal.store)
        const storeLocation = store?.location?.coordinates
        const userLocation = user?.location?.coordinates

        let distanceKm = '0.00' // Default value when locations are missing

        if (storeLocation && userLocation) {
          // Convert [longitude, latitude] to { latitude, longitude }
          const from = { latitude: storeLocation[1], longitude: storeLocation[0] }
          const to = { latitude: userLocation[1], longitude: userLocation[0] }

          // Calculate distance in meters, then convert to km
          const distanceMeters = getDistance(from, to)
          distanceKm = (distanceMeters / 1000).toFixed(2)
        }

        return {
          ...deal,
          storeLocation: store ? store.location : null,
          userLocation: user ? user.location : null,
          distanceKm,
          // Add store details
          store_name: store?.name || null,
          store_address: store?.address || null,
          store_phone_number: store?.phone_number || null,
          store_website: store?.website || null,
          // Add a numeric value for sorting (treat "0.00" as Infinity so it sorts last)
          distanceValue: distanceKm === '0.00' ? Infinity : parseFloat(distanceKm)
        }
      })

      // Then sort the deals by distance
      return dealsWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)
    }
  },

  actions: {
    updateDealsForNewLocation () {
      this.lastLocationUpdate = new Date().getTime()
    },
    async fetchStores () {
      const response = await api.get('stores/')
      this.stores = response.data
    },
    async fetchDeals () {
      const response = await api.get('stores/deal/')
      this.deals = response.data
    },
    async fetchShoppingList () {
      const response = await api.get('stores/shopping_list/')
      this.shopping_list = response.data
    },
    async createShoppingList (list) {
      console.log(list.deals)
      const response = await api.post('stores/shopping_list/', list)
      this.shopping_list.push(response.data)
    },
    async addToShoppingList (shoppingCartId, dealId) {
      console.log('add')
      const list = this.shopping_list.find((li) => li.id === shoppingCartId)
      list.deals.push(dealId)
      await api.put(`stores/shopping_list/${shoppingCartId}/`, list)
    },
    async removeFromShoppingList (shoppingCartId, dealId) {
      const list = this.shopping_list.find((li) => li.id === shoppingCartId)
      const index = list.deals.indexOf(dealId)
      list.deals.splice(index, 1)
      await api.put(`stores/shopping_list/${shoppingCartId}/`, list)
    }

  }
})
