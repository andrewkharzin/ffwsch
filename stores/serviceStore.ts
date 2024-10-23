import { defineStore } from 'pinia'
import type { Database } from '~/types/database' // Import your generated types

// Define types for service operations
type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

export const useServiceStore = defineStore('serviceStore', {
  state: () => ({
    service: {
      id: '',
      service_type_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_time: '',
      description: '',
      status_id: null, // Set default to null until assigned
      user_id: '',
      customer_id: ''
    } as ServiceRow,
    isEditMode: false,
    statusIds: {
      draft: 'a2b67304-0593-4eb7-96b8-97e05a198597', // Hardcoded Draft status ID
      new: '82ca5580-37ae-4e6b-a46a-25242f8ae6c9' // Hardcoded New status ID
    }
  }),

  actions: {
    // Reset service to default values
    async resetService() {
      this.service = {
        id: '',
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_time: '',
        description: '',
        status_id: this.statusIds.draft, // Assign hardcoded Draft status ID
        user_id: '',
        customer_id: ''
      } as ServiceRow

      this.isEditMode = false
      console.log('Service reset with draft status:', this.service.status_id)
    },

    // Set service for editing
    async setService(data: ServiceRow) {
      this.service = { ...data }
      this.isEditMode = true
      this.service.status_id = this.statusIds.new // Assign hardcoded New status ID

      console.log('Service set for editing with new status:', this.service.status_id)
    },

    // Submit service data
    async submitService(): Promise<ServiceRow | null> {
      const supabaseUser = useSupabaseUser() // Get current user
      const supabase = useSupabaseClient()
      const { fetchCustomerByUserId } = useCustomerByUserId() // Fetch customer by user ID

      // Check if the user is authenticated
      if (!supabaseUser.value) {
        console.error('User not logged in.')
        return null // Abort if the user is not authenticated
      }

      // Set user_id to the current user's ID
      this.service.user_id = supabaseUser.value.id

      // Fetch customer and set customer_id
      const customerData = await fetchCustomerByUserId()
      if (customerData) {
        this.service.customer_id = customerData.id // Set customer_id if fetching was successful
      } else {
        console.error('Could not fetch customer data.')
        return null // Abort if customer data fetching failed
      }

      // Set status based on edit mode
      if (this.isEditMode) {
        this.service.status_id = this.statusIds.new // Set "New" status for editing
      } else {
        this.service.status_id = this.statusIds.draft // Set "Draft" status for new requests
      }

      if (!this.service.status_id) {
        console.error('Error: Missing valid status_id.')
        return null // Abort if status is missing
      }

      try {
        // const response = await this.insertService(this.service);
        const response = await useCrudService().insertService(this.service)

        return response
      } catch (error) {
        console.error('Error saving service:', error)
        return null
      }
    },

    // Insert new service into Supabase
    async insertService(newService: ServiceInsert): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        const { data, error } = await supabase
          .from('services')
          .insert(newService)
          .single()

        if (error) {
          console.error('Error inserting service:', error)
          throw new Error('Failed to insert service')
        }

        return data as ServiceRow
      } catch (error) {
        console.error('Failed to insert service:', error)
        return null
      }
    }
  }
})
