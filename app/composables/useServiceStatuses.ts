import { ref } from 'vue';

export const useServiceStatuses = () => {
  const supabase = useSupabaseClient()
  const statuses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchServiceStatuses = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('servicestatuses')
        .select('*');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      statuses.value = data;
    } catch (err) {
      console.error('Error fetching service statuses:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    statuses,
    loading,
    error,
    fetchServiceStatuses,
  };
};
