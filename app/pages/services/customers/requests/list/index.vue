<script setup lang="ts">
const { services } = useServicesByCustomer()

const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    }
    // {
    //   label: "My Requests",
    //   icon: "i-heroicons-queue-list",
    //   component: "NuxtLink",
    //   to: `/services/requests/`,
    // },
  ]
]
console.log('Services from composable:', services) // Add this line to check the data
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="My Orders"
        :badge="services.length"
        class="ml-4"
      />
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>
      <div class="p-6 w-full overflow-y-auto">
        <AppServicesCustomerTable
          v-if="services.length > 0"
          :services="services"
          class="flex-1"
        />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>
