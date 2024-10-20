// composables/useProfile.ts
import { ref } from 'vue';

export const useProfile = () => {
  const client = useSupabaseClient();
  const profile = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const fetchProfile = async (userId: string) => {
    loading.value = true;
    try {
      const { data, error: fetchError } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      profile.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  const updateProfile = async (updatedProfile: any) => {
    const supabase = useSupabaseClient();
    loading.value = true
    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', updatedProfile.id)

    if (error) {
      console.error(error)
      loading.value = false
      return { error }
    }

    loading.value = false
    return { success: true }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};