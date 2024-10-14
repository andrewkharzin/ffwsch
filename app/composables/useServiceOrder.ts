import { ref } from 'vue'

interface ServiceOrder {
  id: string
  service_id: string
  order_date: string
  total_amount: number
  status: string
  serial_number: string
  service: {
    id: string
    service_type_id: string
    user_id: string
    service_date: string
    created_at: string
    description: string | null
    status_id: string | null
    customer_id: string | null
  }
}

export function useServiceOrder() {
  const supabase = useSupabaseClient()
  const serviceOrderDetail = ref<ServiceOrder | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Fetch service order and related service details by service_id
  const fetchServiceOrderWithDetails = async (serviceId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('service_orders')
        .select(`
          id,
          service_id,
          order_date,
          total_amount,
          status,
          serial_number,
          services (
            id,
            service_type_id,
            service_date,
            created_at,
            description,
            status_id,
            customer_id

          )
        `)
        .eq('service_id', serviceId)
        .single() // Fetch a single order with service details

      console.log('Fetched Data:', data) // Log fetched data
      console.log('Fetch Error:', fetchError) // Log any fetch error

      if (fetchError) {
        throw fetchError
      }

      serviceOrderDetail.value = data
    } catch (err) {
      error.value = 'Failed to fetch service order details'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    serviceOrderDetail,
    loading,
    error,
    fetchServiceOrderWithDetails
  }
}
