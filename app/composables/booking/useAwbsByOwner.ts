import { ref } from 'vue';

export default function useAwbsDataByOwner() {
  const ffmRecords = ref([]);
  const pending = ref(false);
  const error = ref<string | null>(null);

  const fetchAwbsDataByUser = async (userId: string) => {
    pending.value = true;
    error.value = null;

    try {
      const supabase = useSupabaseClient();

      // Fetch `ffm` records, related `ffm_telex`, and `ffm_telex_dgr_classes`
      const { data, error: fetchError } = await supabase
        .from('ffm')
        .select(
          `
          *,
          airport_from ( id, name, iata ),
          airport_to ( id, name, iata ),
          ffm_telex (
            id,
            awb_carrier,
            awb_number,
            number_pcs,
            weight,
            volume,
            shipping_name,
            shc,
            parsed_line,
            created_at,
            ffm_telex_dgr_classes (
              dgr_class_id
            )
          )
        `
        )
        // .eq('user_id', userId) // Filter by user ID
        .order('created_at', { ascending: false }); // Order by creation date

      if (fetchError) throw fetchError;

      // Map and process the data, include related `ffm_telex_dgr_classes`
      ffmRecords.value = data.map(record => {
        return {
          ...record,
          ffm_telex: record.ffm_telex.map(telex => ({
            ...telex,
            dgr_classes: telex.ffm_telex_dgr_classes.map(dgr => ({
              dgr_class_id: dgr.dgr_class_id,
              // You can add additional logic to fetch related `dgr_classes` data if needed
            }))
          }))
        };
      }) || [];

      console.log('Fetched AWB data:', data)  // Log the fetched data to verify
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching FFM data.';
    } finally {
      pending.value = false;
    }
  };

  return { ffmRecords, fetchAwbsDataByUser, pending, error };
}