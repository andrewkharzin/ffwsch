import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    role: null as string | null,
    isLoading: true // Track if role is being loaded
  }),
  actions: {
    async fetchUserRole() {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase.auth.getUser()

      if (!error) {
        this.role = data?.user?.app_metadata?.role || null
      }
      this.isLoading = false // Set loading to false after fetching
    },
    setRole(role: string) {
      this.role = role
      this.isLoading = false // No need for loading if role is manually set
    },
    clearRole() {
      this.role = null
    }
  },
  persist: true // Persist state across reloads
})
