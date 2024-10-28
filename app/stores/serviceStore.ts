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
      status_id: null, // Set default to null until assigned
      user_id: '',
      customer_id: ''
    } as ServiceRow,
    isEditMode: false,
    statusIds: {
      draft: '138261c0-235e-4a19-9b1f-c4ef8afe8529', // Hardcoded Draft status ID
      new: 'b3d9ebe7-f348-4fc2-924e-f61256bf13fcs' // Hardcoded New status ID
    }
  }),

  actions: {
    // Reset service to default values
    async resetService() {
      this.service = {
        id: null,
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
    async submitService(): Promise<ServiceRow | null> {
      // Update status if in edit mode
      if (this.isEditMode) {
        this.service.status_id = this.statusIds.new; // Assign hardcoded New status ID
      } else {
        this.service.status_id = this.statusIds.draft; // Assign hardcoded Draft status ID
      }

      // Логируем объект service перед вставкой
      console.log('Service object before submission:', this.service);

      if (!this.service.status_id) {
        console.error('Error: Missing valid status_id.');
        return null; // Prevent submission if the status_id is invalid
      }

      try {
        const response = await this.insertService(this.service);
        return response;
      } catch (error) {
        console.error('Error saving service:', error);
        return null;
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
          throw new Error(error.message)
        }

        return data as ServiceRow
      } catch (error) {
        console.error('Failed to insert service:', error)
        return null
      }
    }
  }
})
