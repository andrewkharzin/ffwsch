// composables/useCurrentProfile.ts
export const useCurrentProfile = () => {
  const user = useSupabaseUser()
  const { profile, fetchProfile, loading, error } = useProfile()

  watchEffect(() => {
    if (user.value) {
      fetchProfile(user.value.id)
    }
  })

  return {
    profile,
    loading,
    error
  }
}
