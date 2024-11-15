import { ref } from 'vue'
export function useFfmDetail() {
  const supabase = useSupabaseClient()
  const pending = ref(true)
  const ffmTelexRecords = ref([])

  const fetchFfmTelexRecords = async (ffmId: string) => {
    pending.value = true
    try {
      const { data, error } = await supabase
        .from('ffm_telex')
        .select('awb_carrier, awb_number, number_pcs, weight, volume, shipping_name, shc, flight, parsed_line')
        .eq('ffm_id', ffmId)

      if (error) {
        console.error('Error fetching FFM Telex records:', error)
      } else {
        ffmTelexRecords.value = data || []
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      pending.value = false
    }
  }

  return {
    ffmTelexRecords,
    pending,
    fetchFfmTelexRecords,
  }
}
