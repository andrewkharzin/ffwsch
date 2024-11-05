import { ref } from 'vue'
import type { Database } from '@/types/supabase' // Adjust path if needed

type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

export default function useTestServiceCrud() {
  const supabase = useSupabaseClient()
  const services = ref<ServiceRow[]>([])
  const service = ref<ServiceRow | null>(null)
  const error = ref<string | null>(null)

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
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      services.value = data || []
    } catch (err) {
      error.value = `Error fetching services: ${err.message}`
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
        .single()

      if (fetchError) throw fetchError

      service.value = data
      console.log('Fetched edited service:', data) // Log fetched service details
    } catch (err) {
      error.value = `Error fetching service by ID: ${err.message}`
    }
  }

  // Insert a new service
  async function insertService(newService: ServiceInsert) {
    try {
      const { data, error: insertError } = await supabase
        .from('services')
        .insert(newService)
        .single()

      if (insertError) throw insertError
      services.value.push(data)
      return data
    } catch (err) {
      error.value = `Error inserting service: ${err.message}`
      return null
    }
  }

  // Update an existing service by ID
  async function updateService(serviceId: string, updates: ServiceUpdate) {
    const { customer_id, description, service_date, service_type_id, status } = updates
    const updatesData: Partial<ServiceUpdate> = {}

    if (customer_id) updatesData.customer_id = customer_id
    if (description) updatesData.description = description
    if (service_date) updatesData.service_date = service_date
    if (service_type_id) updatesData.service_type_id = service_type_id
    if (status) updatesData.status = status

    console.log('Updates to be sent:', updatesData)

    try {
      const { data, error } = await supabase
        .from('services')
        .update(updatesData)
        .eq('id', serviceId)

      if (error) {
        console.error('Update error details:', error.message) // Log the error message
        console.error('Error code:', error.code) // Log the error code
        console.error('Error details:', error.details) // Log additional error details
        return null
      }

      console.log('Updated service data:', data)
      return data
    } catch (err) {
      console.error('Unexpected error:', err)
      return null
    }
  }

  // Delete a service by ID
  async function deleteService(serviceId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (deleteError) throw deleteError

      // Remove the service from the local array
      services.value = services.value.filter(s => s.id !== serviceId)
    } catch (err) {
      error.value = `Error deleting service: ${err.message}`
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
    deleteService
  }
}
