// composables/useServiceCustomerFlights.ts
import { ref } from 'vue';

export function useServiceCustomerFlights() {
  const supabase = useSupabaseClient();
  const flights = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchFlights = async (flightNumber: string) => {
    loading.value = true;
    error.value = null;

    const { data, error: fetchError } = await supabase
      .from('service_customer_flights')
      .select('*')
      .ilike('flight_number', `%${flightNumber}%`);

    if (fetchError) {
      error.value = fetchError.message;
    } else {
      flights.value = data || [];
    }

    loading.value = false;
  };

  return {
    flights,
    loading,
    error,
    fetchFlights,
  };
}
