import { defineStore } from 'pinia';
import type { Database } from '~/types/database';

// Define types for service operations
type ServiceRow = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

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
      customer_id: ''
    } as ServiceRow,
    isEditMode: false,
    statusIds: {
      draft: '138261c0-235e-4a19-9b1f-c4ef8afe8529',
      new: 'b3d9ebe7-f348-4fc2-924e-f61256bf13fcs'
    }
  }),

  actions: {
    async resetService() {
      this.service = {
        id: null,
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_time: '',
        description: '',
        status_id: this.statusIds.draft,
        user_id: '',
        customer_id: ''
      } as ServiceRow;
      this.isEditMode = false;
      console.log('Service reset with draft status:', this.service.status_id);
    },

    async setService(data: ServiceRow) {
      this.service = { ...data };
      this.isEditMode = true;
      this.service.status_id = this.statusIds.new;
      console.log('Service set for editing with new status:', this.service.status_id);
    },

    async submitService(): Promise<ServiceRow | null> {
      this.service.status_id = this.isEditMode ? this.statusIds.new : this.statusIds.draft;
      console.log('Service object before submission:', this.service);

      if (!this.service.status_id) {
        console.error('Error: Missing valid status_id.');
        return null; // Prevent submission if the status_id is invalid
      }

      try {
        const response = await this.insertService(this.service);
        if (!response) {
          console.error('Insert service failed: No response received.');
          return null;
        }
        console.log('Service successfully created:', response); // Log successful creation
        return response;
      } catch (error) {
        console.error('Error saving service:', error);
        return null;
      }
    },

    async insertService(newService: ServiceInsert): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient();
      try {
        const { data, error, status } = await supabase
          .from('services')
          .insert(newService)
          .select() // This will retrieve the inserted row
          .single(); // Ensure you're expecting a single response

        // Log the entire response for debugging
        console.log('Full Supabase response:', { data, error, status });

        if (error) {
          console.error('Error inserting service:', error.message);
          // Add more context to the error
          throw new Error(`Insert failed: ${error.message} (Status: ${status})`);
        }

        console.log('Insert service response:', data);
        return data as ServiceRow; // Ensure this matches the expected type
      } catch (error) {
        console.error('Failed to insert service:', error);
        return null;
      }
    }

  }
});
