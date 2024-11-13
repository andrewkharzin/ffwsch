import { ref } from 'vue'

export const useStatuses = () => {
  const supabase = useSupabaseClient()
  const statuses = ref([])

  async function fetchStatuses() {
    const { data, error } = await supabase.from('servicestatuses').select('id, status')
    if (error) console.error(error)
    statuses.value = data || []
  }

  return { statuses, fetchStatuses }
}
