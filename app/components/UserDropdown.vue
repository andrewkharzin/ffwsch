<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { isHelpSlideoverOpen } = useDashboard()
const { isDashboardSearchModalOpen } = useUIState()
const { metaSymbol } = useShortcuts()
const loading = ref(false)

// Fetch the current user's profile using the composable
const {
  profile,
  loading: profileLoading,
  error: profileError
} = useCurrentProfile()

const items = computed(() => [
  [
    {
      slot: 'account',
      label: '',
      disabled: true
    }
  ],
  [
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-8-tooth',
      to: '/settings'
    },
    {
      label: 'Command menu',
      icon: 'i-heroicons-command-line',
      shortcuts: [metaSymbol.value, 'K'],
      click: () => {
        isDashboardSearchModalOpen.value = true
      }
    },
    {
      label: 'Help & Support',
      icon: 'i-heroicons-question-mark-circle',
      shortcuts: ['?'],
      click: () => (isHelpSlideoverOpen.value = true)
    }
  ],
  [
    {
      label: 'Documentation',
      icon: 'i-heroicons-book-open',
      to: 'https://ui.nuxt.com/pro/getting-started',
      target: '_blank'
    },
    {
      label: 'GitHub repository',
      icon: 'i-simple-icons-github',
      to: 'https://github.com/nuxt-ui-pro/dashboard',
      target: '_blank'
    },
    {
      label: 'Buy Nuxt UI Pro',
      icon: 'i-heroicons-credit-card',
      to: 'https://ui.nuxt.com/pro/purchase',
      target: '_blank'
    }
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: async () => await logout()
    }
  ]
])

// const logout = async () => {
//   loading.value = true;
//   const { error } = await supabase.auth.signOut();
//   if (error) {
//     loading.value = false;
//     return alert("Something went wrong !");
//   }
// };

const logout = async () => {
  loading.value = true
  const { error } = await supabase.auth.signOut()

  if (error) {
    loading.value = false
    return alert('Something went wrong!')
  }

  // Successfully logged out, now redirect to login page
  const router = useRouter() // Get the router instance
  loading.value = false
  router.push('/login') // Redirect to the login page
}
</script>

<template>
  <UDropdown
    mode="hover"
    :items="items"
    :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }"
    class="w-full"
  >
    <template #default="{ open }">
      <UButton
        color="gray"
        variant="ghost"
        class="w-full"
        :label="profile?.full_name"
        :class="[open && 'bg-gray-50 dark:bg-gray-800']"
      >
        <template #leading>
          <!-- Use the fetched avatar_url from the profile -->
          <UAvatar
            :src="profile?.avatar_url"
            size="2xs"
          />
        </template>

        <template #trailing>
          <UIcon
            name="i-heroicons-ellipsis-vertical"
            class="w-5 h-5 ml-auto"
          />
        </template>
      </UButton>
    </template>

    <template #account>
      <div class="text-left">
        <p>Signed in as</p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
          {{ user.email }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>
