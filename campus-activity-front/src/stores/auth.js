import { defineStore } from 'pinia'
import { apiLogin, apiMe } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null,
  }),

  actions: {
    async login(account, password) {
      const data = await apiLogin({ account, password })
      this.token = data.token
      this.user = data.user
    },

    logout() {
      this.token = ''
      this.user = null

    },

    async fetchMe() {
      this.user = await apiMe()
    }
  }
})
