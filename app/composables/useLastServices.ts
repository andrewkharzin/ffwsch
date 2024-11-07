import { ref, onMounted, onUnmounted } from 'vue';

export const useLastServices = () => {
  const lastServices = ref([]);
  const supabase = useSupabaseClient()

  const fetchLastServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, created_at, user_id, status_id, servicestatuses:status_id(status), customers:customer_id(email, full_name, customer_company:company_id(company_name, logo))')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      lastServices.value = data || [];
    } catch (error) {
      console.error("Error fetching last services:", error);
    }
  };

  // Set up real-time listener for changes in services table
  const setupRealTimeListener = () => {
    supabase
      .channel('services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchLastServices();
      })
      .subscribe();
  };

  onMounted(() => {
    fetchLastServices();
    setupRealTimeListener();
  });

  onUnmounted(() => {
    supabase.removeChannel('services-realtime');
  });

  return { lastServices };
};
