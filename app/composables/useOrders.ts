// composables/useOrders.ts
import { ref } from 'vue'

export const useOrders = () => {

  const supabase = useSupabaseClient()
  const orders = ref([])
  const loading = ref(true)
  const error = ref(null)

  const fetchOrders = async () => {
    const { data, error: fetchError } = await supabase
      .from('service_orders')
      .select('*')

    if (fetchError) {
      error.value = fetchError
    } else {
      orders.value = data
    }
    loading.value = false
  }

  fetchOrders()

  return { orders, loading, error }
}
