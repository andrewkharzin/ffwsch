export const fetchAuthUsers = async () => {
  const supabase = useSupabaseClient()
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  return data.users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.raw_app_meta_data?.role || 'N/A',
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
  }));
};
