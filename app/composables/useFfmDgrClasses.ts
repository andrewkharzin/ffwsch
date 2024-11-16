import { ref } from 'vue'

export function useDgrClasses() {
  const supabase = useSupabaseClient()
  const pending = ref(false)
  const dgrClasses = ref<any[]>([])

  const fetchDgrClassesForTelex = async (ffmTelexId: string) => {
    pending.value = true
    try {
      // Fetching dgr_classes related to a specific ffm_telex_id via the bridge table
      const { data, error } = await supabase
        .from('ffm_telex_dgr_classes')
        .select('dgr_classes (id, icao_class, description, iata_code, label, examples, emergency_actions, label_link)')
        .eq('ffm_telex_id', ffmTelexId)

      if (error) {
        console.error('Error fetching DGR classes:', error)
        dgrClasses.value = []
      } else {
        dgrClasses.value = data.map(item => item.dgr_classes) // Access the nested dgr_classes data
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      pending.value = false
    }
  }

  return {
    dgrClasses,
    pending,
    fetchDgrClassesForTelex
  }
}
