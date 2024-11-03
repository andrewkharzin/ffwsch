import { ref } from 'vue'

export const useServiceById = (serviceId) => {
  const supabase = useSupabaseClient()
  const serviceData = ref(null)
  const loading = ref(true)
  const error = ref(null)

  if (!serviceId) {
    console.error('Invalid service ID provided:', serviceId)
    error.value = 'Service ID is required.'
    loading.value = false
    return { serviceData, loading, error }
  }

  const fetchServiceData = async () => {
    try {
      console.log('Fetching service data for ID:', serviceId)

      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          service_date,
          service_time,
          servicetype (type_name),
          servicestatuses(status),
          customers(full_name, company_id(company_name)),
          service_orders(serial_number),
          service_customer_item_services!inner (
            service_customer_items (
              item_name,
              item_description,
              item_partnumber,
              item_characteristics
            )
          )
        `)
        .eq('id', serviceId)
        .single()

      if (fetchError) {
        console.error('Error fetching data:', fetchError)
        throw new Error(fetchError.message || 'Unknown error occurred')
      }

      console.log('Fetched service data:', data)
      serviceData.value = data
    } catch (fetchError) {
      error.value = fetchError.message
      console.error('Fetch error:', fetchError)
    } finally {
      loading.value = false
      console.log('Loading state:', loading.value)
    }
  }

  fetchServiceData()

  return {
    serviceData,
    loading,
    error
  }
}
