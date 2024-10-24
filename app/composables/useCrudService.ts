import { ref, toRaw } from 'vue';
import type { Database } from '@/types/database';

type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export const useCrudService = () => {
  const supabase = useSupabaseClient();

  // Insert service
  const insertService = async (serviceData: ServiceInsert) => {
    const rawServiceData = toRaw(serviceData); // Убираем реактивность
    console.log('Preparing to insert service with data:', rawServiceData); // Log the data to be inserted

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([rawServiceData]); // Используем rawServiceData

      console.log('Inserting service with data:', rawServiceData);
      if (error) {
        throw new Error(`Failed to insert service: ${error.message}`);
      }

      console.log('Service inserted:', data);
      return data;
    } catch (error) {
      console.error('Error inserting service:', error);
      throw error; // Re-throw error for higher-level handling
    }
  };

  // Update service
  const updateService = async (id: string, serviceData: ServiceUpdate) => {
    const rawServiceData = toRaw(serviceData); // Убираем реактивность
    console.log('Preparing to update service with data:', rawServiceData);

    try {
      const { data, error } = await supabase
        .from('services')
        .update(rawServiceData) // Используем rawServiceData
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update service: ${error.message}`);
      }

      console.log('Service updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error; // Re-throw error for higher-level handling
    }
  };

  // Delete service
  const deleteService = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete service: ${error.message}`);
      }

      console.log('Service deleted:', data);
      return data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error; // Re-throw error for higher-level handling
    }
  };

  return {
    insertService,
    updateService,
    deleteService
  };
};
