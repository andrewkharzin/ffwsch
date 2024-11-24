import { ref } from 'vue';

export default function useBookings() {
  const supabase = useSupabaseClient();

  const bookings = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchBookings = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('awbs')
        .select(`
          id,
          awb_number:ffm_telex (id, awb_carrier, number_pcs, weight, volume, shipping_name),
          date_created,
          book_type,
          status:bookstatus (id, status, description),
          shipper:shippers (id, fido, address, city, state, zip, phone, account_number),
          consignee:consignees (id, fido, address, city, state, zip, phone, account_number),
          flight
        `);

      if (fetchError) throw fetchError;

      bookings.value = data || [];
    } catch (err) {
      error.value = err.message || 'Error fetching bookings';
    } finally {
      loading.value = false;
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
  };
}
