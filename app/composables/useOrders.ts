// composables/useOrders.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

export const useOrders = () => {
  const supabase = useSupabaseClient()
  const orders = ref([])
  const loading = ref(true)
  const error = ref(null)
  const newOrderAlert = ref(false)

  // Fetch orders initially
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

  // Listen for all real-time changes (INSERT, UPDATE, DELETE) using Supabase Channels
  const subscribeToOrderChanges = () => {
    const channel = supabase
      .channel('service_orders_channel')

      // Listen for INSERT events
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_orders' }, (payload) => {
        const newOrder = payload.new
        orders.value.push(newOrder) // Add new order to the orders list
        newOrderAlert.value = true // Set alert to true for flashing the Orders link
        // Remove the flash alert after 3 seconds
        setTimeout(() => {
          newOrderAlert.value = false
        }, 3000)
      })

      // Listen for UPDATE events
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_orders' }, (payload) => {
        const updatedOrder = payload.new
        const index = orders.value.findIndex(order => order.id === updatedOrder.id)
        if (index !== -1) {
          orders.value[index] = updatedOrder // Update the order in the list
        }
      })

      // Listen for DELETE events
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'service_orders' }, (payload) => {
        const deletedOrderId = payload.old.id
        orders.value = orders.value.filter(order => order.id !== deletedOrderId) // Remove the deleted order
      })

      .subscribe()

    return channel
  }

  // Lifecycle hook to subscribe and unsubscribe from the channel
  onMounted(() => {
    fetchOrders()
    const channel = subscribeToOrderChanges()

    onBeforeUnmount(() => {
      supabase.removeChannel(channel)
    })
  })

  return { orders, loading, error, newOrderAlert }
}
