import { ref } from 'vue'

export const useServiceById = (serviceId: string) => {
  const supabase = useSupabaseClient()
  const serviceData = ref(null)
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)

  const fetchServiceData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          id,
          description,
          service_date,
          customers(full_name, company_id(company_name), profiles(avatar_url)),
          service_orders(serial_number)
        `)
        .eq('id', serviceId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      serviceData.value = data
    } catch (fetchError) {
      error.value = fetchError.message
    } finally {
      loading.value = false
    }
  }

  fetchServiceData()

  return {
    serviceData,
    loading,
    error
  }
}
