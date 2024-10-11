import { ref } from 'vue';
import { Database } from '~/types/database'; // Assuming you have typed your Supabase database

export const useCustomers = () => {
  const supabase = useSupabaseClient<Database>(); // Use your typed database schema
  const customers = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch customers data
  const fetchCustomers = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select(`
          id,
          full_name,
          address,
          phone,
          email,
          number_id,
          ccode,
          position,
          department,
          company_id (
            company_name,
            logo
          ),
          user_id
        `);

      if (fetchError) throw fetchError;
      customers.value = data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return { customers, loading, error, fetchCustomers };
};
