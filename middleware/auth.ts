// File: middleware/auth.ts

import { getCookie } from 'h3'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const event = useNuxtApp().ssrContext?.event
  const authToken = getCookie(event, 'supabase-auth-token') // Use getCookie to retrieve the token

  if (!authToken) {
    return navigateTo('/login')
  }

  const { data: user, error } = await supabase.auth.getUser(authToken)

  if (!user || error) {
    return navigateTo('/login')
  }
})
