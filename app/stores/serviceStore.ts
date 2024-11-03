import { defineStore } from 'pinia'
import type { Database } from '~/types/database'

// Define types for service operations
type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

export const useServiceStore = defineStore('serviceStore', {
  state: () => ({
    service: {
      id: null,
      service_type_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_time: '',
      description: '',
      status_id: null,
      user_id: '',
      customer_id: '',
      customer_flight: '',
      flight: '',
      flight_date_time: ''
    } as ServiceRow,
    isEditMode: false,
    isSending: false, // Новое состояние для отслеживания отправки
    statusIds: {
      draft: '138261c0-235e-4a19-9b1f-c4ef8afe8529',
      new: 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc'
    },
    resetForm() {
      this.service.service_type_id = null
      this.service.description = ''
      this.service.status_id = null
      // Reset other fields to their default values...
    }
  }),

  actions: {
    resetService() {
      this.service = {
        id: null,
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_time: '',
        description: '',
        status_id: this.statusIds.draft,
        user_id: '',
        customer_id: '',
        flight: '',
        flight_date_time: ''
      } as ServiceRow
      this.isEditMode = false
      console.log('Service reset with draft status:', this.service.status_id)
    },

    setEditMode(value: boolean) {
      this.isEditMode = value
      if (!value) {
        this.resetService() // Reset the service if exiting edit mode
      }
    },

    setService(data: ServiceRow) {
      this.service = { ...data }
      this.isEditMode = true
      this.service.status_id = this.statusIds.new // Update to new status when in edit mode
      console.log('Service set for editing with new status:', this.service.status_id)
    },

    async fetchServiceById(id: string): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching service by ID:', error)
          return null
        }

        console.log('Fetched service data:', data)
        this.service = data as ServiceRow
        this.isEditMode = true
        return data
      } catch (error) {
        console.error('Error in fetchServiceById:', error)
        return null
      }
    },

    async submitService(): Promise<ServiceRow | null> {
      this.service.status_id = this.isEditMode ? this.statusIds.new : this.statusIds.draft
      console.log('Service object before submission:', this.service)

      if (!this.service.status_id) {
        console.error('Error: Missing valid status_id.')
        return null // Prevent submission if the status_id is invalid
      }

      this.isSending = true; // Устанавливаем состояние отправки в true
      try {
        const response = await this.insertService(this.service)
        if (!response) {
          console.error('Insert service failed: No response received.')
          return null
        }
        console.log('Service successfully created:', response) // Log successful creation
        return response
      } catch (error) {
        console.error('Error saving service:', error)
        return null
      } finally {
        this.isSending = false; // Останавливаем состояние отправки в любом случае
      }
    },

    async insertService(newService: ServiceInsert): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        const { data, error, status } = await supabase
          .from('services')
          .insert(newService)
          .select() // This will retrieve the inserted row
          .single() // Ensure you're expecting a single response

        console.log('Full Supabase response:', { data, error, status })

        if (error) {
          console.error('Error inserting service:', error.message)
          throw new Error(`Insert failed: ${error.message} (Status: ${status})`)
        }

        console.log('Insert service response:', data)
        return data as ServiceRow
      } catch (error) {
        console.error('Failed to insert service:', error)
        return null
      }
    },

    async updateService(updatedService: ServiceUpdate): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        console.log('Updating service with ID:', updatedService.id); // Log the ID
        const { data, error } = await supabase
          .from('services')
          .update(updatedService)
          .eq('id', updatedService.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating service:', error.message)
          return null
        }

        this.service = data as ServiceRow
        console.log('Service successfully updated:', data)

        return data
      } catch (error) {
        console.error('Failed to update service:', error)
        return null
      }
    }
  }
})
