import { defineStore } from 'pinia'
import { api } from '../boot/axios.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [],
    token: JSON.parse(window.localStorage.getItem('token')) || '', // Initialize with local storage value
    isAuthenticated: !!window.localStorage.getItem('token')
  }),

  getters: {
    decodeToken (state) {
      if (state.token && state.token.access) {
        const accessToken = state.token.access
        const base64Url = accessToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
            .join('')
        )
        return JSON.parse(jsonPayload)
      }
      return {}
    },
    userId () {
      const decodedToken = this.decodeToken
      return decodedToken.user_id
    },
    profile (state) {
      const { userId } = this
      const { users } = state
      return users.find((user) => user.id === userId)
    }
  },

  actions: {
    async fetchUsers () {
      const response = await api.get('accounts/')
      this.users = response.data
    },
    async editPartialUser (user) {
      const response = await api.patch(`accounts/${user.id}/`, user)
      const indexUser = this.users.find(u => u.id === user.id)
      const index = this.users.indexOf(indexUser)
      this.users[index] = response.data
    },
    async doLogin (credentials) {
      const response = await api.post('api/token/', credentials)

      this.token = response.data
      this.isAuthenticated = true
      window.localStorage.setItem('token', JSON.stringify(response.data))
      api.defaults.headers.common.Authorization = `JWT ${response.data.access}`
      this.getMe(response.data)
    },

    async doRegister (credentials) {
      const response = await api.post('accounts/', credentials)
      console.log(response.data)
      this.users.push(response.data)
    },
    logout () {
      api.defaults.headers.common.Authorization = ''
      this.token = ''
      window.localStorage.removeItem('token')
      this.isAuthenticated = false
    },

    async getMe (token) {
      const accessToken = token.access
      const base64Url = accessToken.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      )
      const parsedPayload = JSON.parse(jsonPayload)
      this.user_id = parsedPayload.user_id
    },

    async initAuth () {
      const token = localStorage.getItem('token')
      if (token) {
        const parsedToken = JSON.parse(token)
        const currentTime = Math.floor(Date.now() / 1000) // Get current time in seconds
        const decodedToken = this.decodeToken

        // Check if the token is expired
        if (decodedToken.exp > currentTime) {
          this.token = parsedToken
          this.isAuthenticated = true
          api.defaults.headers.common.Authorization = `JWT ${this.token.access}`
        } else {
          // Token is expired, handle accordingly
          this.token = ''
          window.localStorage.removeItem('token')
          this.isAuthenticated = false
        }
      } else {
        this.token = ''
        window.localStorage.removeItem('token')
        this.isAuthenticated = false
      }
    },
    async changePassword (payload) {
      console.log('Payload:', payload)
      const response = await api.post('accounts/change-password/', payload)

      return response.data
    }

  }
})
