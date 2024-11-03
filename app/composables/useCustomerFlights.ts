import { ref, onMounted } from 'vue'

const customerFlights = ref([])

export const useCustomerFlights = async () => {
  const supabase = useSupabaseClient()
  const { data, error } = await supabase
    .from('service_customer_flights')
    .select('id, flight_number, flight_route, flight_pst')

  if (error) {
    console.error('Error fetching customer flights:', error)
  } else {
    // Format data for USelect options
    customerFlights.value = data.map(flight => ({
      label: `${flight.flight_number} - ${flight.flight_route}`,
      value: flight.id
    }))
  }
}

onMounted(() => {
  fetchCustomerFlights()
})
