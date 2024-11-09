import { ref, onMounted, onUnmounted } from 'vue'
import { nextTick } from 'vue'
import type { ServiceWithRelations } from '@/types/types'

export const useServicesByCustomer = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const services = ref<ServiceWithRelations[]>([]) // Make this reactive
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)
  let subscription: any = null

  const fetchServices = async (): Promise<void> => {
    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          id,
          user_id,
          service_date,
          status_id,
          description,
          customers (full_name),
          servicestatuses (status),
          servicetype (type_name),
          service_customer_flights (
            flight_number,
            flight_route,
            flight_pst
          )
        `)
        .eq('user_id', user.value?.id) // Filter by user_id
      console.log('Customer services', data)
      if (fetchError) {
        console.error('Error fetching services:', fetchError)
        error.value = fetchError.message
      } else {
        services.value = data || []
      }
    } catch (fetchError) {
      error.value = (fetchError as Error).message
      console.error('Error fetching services:', fetchError)
    } finally {
      loading.value = false
    }
  }

  const setupRealtimeChannel = () => {
    subscription = supabase
      .channel('realtime:services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
        const updatedService = payload.new as ServiceWithRelations
        const index = services.value.findIndex((s) => s.id === updatedService.id)

        if (payload.eventType === 'DELETE' && index !== -1) {
          services.value.splice(index, 1)
        } else if (index !== -1) {
          services.value[index] = updatedService
        } else if (payload.eventType === 'INSERT') {
          services.value.push(updatedService)
        }

        // Force reactivity by creating a new array reference
        services.value = [...services.value]

        console.log('Real-time service update:', payload)

        // Use nextTick to ensure UI update after the data change
        nextTick(() => {
          console.log('UI should now reflect the updated service data')
        })
      })
      .subscribe()
  }


  onMounted(() => {
    fetchServices()
    setupRealtimeChannel()
  })

  onUnmounted(() => {
    if (subscription) {
      subscription.unsubscribe()
    }
  })

  return {
    services, // Return services here
    loading,
    error
  }
}
