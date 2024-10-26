import { ref } from 'vue';

// Define types for service row and insert operations
import type { Database } from '../types/supabase'; // Adjust path if needed

type ServiceRow = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Partial<ServiceInsert>;

export default function useTestServiceCrud() {
  const supabase = useSupabaseClient();
  const services = ref<ServiceRow[]>([]);
  const service = ref<ServiceRow | null>(null);
  const error = ref<string | null>(null);

  // Fetch all services with related data
  async function fetchAllServices() {
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          *,
          servicestatuses(status, id),
          servicetype(type_name, description),
          customers(
            full_name,
            address,
            phone,
            email,
            customer_company(company_name, contact_info)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      services.value = data || [];
    } catch (err) {
      error.value = `Error fetching services: ${err.message}`;
    }
  }

  // Fetch a single service by ID with related data
  async function fetchServiceById(serviceId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          *,
          servicestatuses(status, id),
          servicetype(type_name, description),
          customers(
            full_name,
            address,
            phone,
            email,
            customer_company(company_name, contact_info)
          )
        `)
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;
      service.value = data;
    } catch (err) {
      error.value = `Error fetching service by ID: ${err.message}`;
    }
  }

  // Insert a new service
  async function insertService(newService: ServiceInsert) {
    try {
      const { data, error: insertError } = await supabase
        .from('services')
        .insert(newService)
        .single();

      if (insertError) throw insertError;
      services.value.push(data);
      return data;
    } catch (err) {
      error.value = `Error inserting service: ${err.message}`;
      return null;
    }
  }

  // Update an existing service by ID
  async function updateService(serviceId: string, updates: ServiceUpdate) {
    try {
      const { data, error: updateError } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .single();

      if (updateError) throw updateError;

      // Update the service in the local array
      const index = services.value.findIndex(s => s.id === serviceId);
      if (index !== -1 && data) services.value[index] = data;

      return data;
    } catch (err) {
      error.value = `Error updating service: ${err.message}`;
      return null;
    }
  }

  // Delete a service by ID
  async function deleteService(serviceId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (deleteError) throw deleteError;

      // Remove the service from the local array
      services.value = services.value.filter(s => s.id !== serviceId);
    } catch (err) {
      error.value = `Error deleting service: ${err.message}`;
    }
  }

  return {
    services,
    service,
    error,
    fetchAllServices,
    fetchServiceById,
    insertService,
    updateService,
    deleteService,
  };
}
