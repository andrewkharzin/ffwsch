export function useNewService() {
  const supabase = useSupabaseClient()

  const serviceTypes = ref([])
  const statuses = ref([])

  // Fetch service types from the `servicetype` table
  const fetchServiceTypes = async () => {
    const { data, error } = await supabase.from('servicetype').select('*')
    if (error) {
      console.error('Error fetching service types:', error.message)
    } else {
      serviceTypes.value = data
    }
  }

  // Fetch statuses from the `servicestatuses` table
  const fetchStatuses = async () => {
    const { data, error } = await supabase.from('servicestatuses').select('*')
    if (error) {
      console.error('Error fetching statuses:', error.message)
    } else {
      statuses.value = data
    }
  }

  // Create a new service record in the `services` table
  const createService = async (newService: any) => {
    const { data, error } = await supabase.from('services').insert([newService])
    if (error) {
      return { error }
    }
    return { data }
  }

  return {
    serviceTypes,
    statuses,
    fetchServiceTypes,
    fetchStatuses,
    createService
  }
}
