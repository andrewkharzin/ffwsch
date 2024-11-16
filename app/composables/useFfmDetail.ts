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
        .select('awb_carrier, awb_number, number_pcs, weight, volume, shipping_name, shc, parsed_line, dgr_classes (iata_code)')
        .eq('ffm_id', ffmId)
      console.log("FfetchFfmTelexRecords", data)
      if (error) {
        console.error('Error fetching FFM Telex records:', error)
      } else {
        ffmTelexRecords.value = data.map(record => ({
          ...record,
          // Join all iata_code values into a string (comma separated), or select the first one
          dgr_code: record.dgr_classes && record.dgr_classes.length > 0
            ? record.dgr_classes.map(dgr => dgr.iata_code).join('/')  // Or use record.dgr_classes[0].iata_code for first code
            : 'N/A'
        }))
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      pending.value = false
    }
  }

  // Computed properties for totals
  const totalPcs = computed(() =>
    ffmTelexRecords.value.reduce((sum, record) => sum + (record.number_pcs || 0), 0)
  )
  const totalWeight = computed(() =>
    ffmTelexRecords.value.reduce((sum, record) => sum + (record.weight || 0), 0)
  )
  const totalVolume = computed(() =>
    ffmTelexRecords.value.reduce((sum, record) => sum + (record.volume || 0), 0)
  )

  return {
    ffmTelexRecords,
    pending,
    fetchFfmTelexRecords,
    totalPcs,
    totalWeight,
    totalVolume,
  }
}
