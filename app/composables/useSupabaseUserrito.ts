// ~/composables/useSupabaseUser.ts
import { ref, onMounted } from 'vue'

export function useSupabaseUserrito() {
  const supabase = useSupabaseClient()
  const user = ref(null)

  onMounted(async () => {
    const { data: { user: loggedInUser } } = await supabase.auth.getUser()
    user.value = loggedInUser
  })

  return { user }
}
