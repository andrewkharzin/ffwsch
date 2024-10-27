// stores/useServiceStore.js
import { defineStore } from 'pinia'


export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    userRole: null, // To hold the user role
  }),
  actions: {
    async fetchServices() {
      const supabase = useSupabaseClient()  // Call within each action
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching services:', error)
      } else {
        this.services = data || []
      }
    },

    async addService(serviceData) {
      const supabase = useSupabaseClient()
      serviceData.status_id = await this.getStatusIdByName('Draft')

      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)

      if (error) {
        console.error('Error adding service:', error)
      } else {
        this.services.push(data[0]) // Add the new service to the local state
      }
    },

    async updateService(serviceData) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .match({ id: serviceData.id })

      if (error) {
        console.error('Error updating service:', error)
      } else {
        // Update the local state
        const index = this.services.findIndex(s => s.id === serviceData.id)
        if (index !== -1) {
          this.services[index] = { ...this.services[index], ...serviceData }
        }
      }
    },

    async changeStatus(serviceId, newStatus) {
      const supabase = useSupabaseClient()
      const statusId = await this.getStatusIdByName(newStatus)

      await this.updateService({ id: serviceId, status_id: statusId })
    },

    async getStatusIdByName(statusName) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('servicestatuses')
        .select('id')
        .eq('status', statusName)
        .single()

      return data ? data.id : null
    },

    setUserRole(role) {
      this.userRole = role // Set the user role
    },
  },
})
