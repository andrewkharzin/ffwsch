import { ref, onMounted } from 'vue'

export interface Customer {
  full_name: string;
}

export interface ServiceWithRelations {
  id: string;
  user_id: string;
  service_date: string; // or Date, depending on your data structure
  status_id: string;
  description: string | null;
  customers: Customer; // assuming a one-to-one relationship
}

export const useServicesByCustomer = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const services = ref<ServiceWithRelations[]>([])
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)

  const fetchServices = async (): Promise<void> => {
    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('services')
        .select('id, user_id, service_date, status_id, description, customers (full_name)')
        .eq('user_id', user.value?.id) // Filter by user_id
      console.log('Customer services', data)
      if (fetchError) {
        console.error('Error fetching services:', fetchError)
        error.value = fetchError.message
      } else {
        services.value = data || []
      }
    } catch (fetchError) {
      error.value = fetchError.message
      console.error('Error fetching services:', fetchError)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchServices()
  })

  return {
    services,
    loading,
    error
  }
}
