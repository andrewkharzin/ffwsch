import { ref } from 'vue'
// import { useSupabaseClient } from '@supabase/supabase-js' // Ensure you have this imported
import type { Database } from '@/types/supabase' // Import Supabase types

type Service = Database['public']['Tables']['customer_company']['Row']

interface ServiceType {
  type_name: string
}

interface Customer {
  full_name: string
  company_name?: string
  logo?: string
}

interface ServiceStatus {
  status: string
}

interface OrderNumber {
  serial_number: string
}

// Combine service with related fields
type ServiceWithRelations = Service & {
  servicetype?: ServiceType
  customers?: Customer
  servicestatuses?: ServiceStatus
  service_orders?: OrderNumber
}

export const useServices = () => {
  const supabase = useSupabaseClient()
  const services = ref<ServiceWithRelations[]>([])
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)

  // Fetch services function
  const fetchServices = async (): Promise<void> => {
    try {
      // Fetch data from Supabase
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          id,
          service_type_id,
          customer_id,
          service_date,
          created_at,
          status_id,
          description,
          servicetype (type_name),
          customers (full_name, number_id, department, position, email, company_id:customer_company(company_name, logo)),
          servicestatuses (status),
          service_orders (service_id, serial_number)
        `)

      if (fetchError) {
        console.error('Error fetching services:', fetchError)
      } else {
        console.log('Raw Data:', JSON.stringify(data, null, 2))
      }
      // Log the raw data for debugging
      console.log('Fetched Data:', data)

      // Map data to desired structure
      services.value = (data as ServiceWithRelations[]).map(service => ({
        ...service,
        type_name: service.servicetype?.type_name || 'N/A', // Service type name
        full_name: service.customers?.full_name || 'N/A', // Customer full name
        status: service.servicestatuses?.status || 'N/A', // Service status
        serial_number: service.service_orders?.serial_number || 'N/A' // Service status
      }))
    } catch (fetchError) {
      error.value = fetchError.message
      console.error('Error fetching services:', fetchError)
    } finally {
      loading.value = false
    }
  }

  // Fetch services when the composable is used
  fetchServices()

  return {
    services,
    loading,
    error
  }
}
