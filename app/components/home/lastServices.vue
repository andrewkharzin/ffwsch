<script setup lang="ts">
const { lastServices } = useLastServices()
// Helper function to get badge color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'yellow'
    case 'Completed':
      return 'primary'
    case 'New':
      return 'blue'
    default:
      return 'gray'
  }
}
</script>

<template>
  <UDashboardCard
    title="Recent Services"
    description="Latest services published by customers."
    icon="i-heroicons-cog-6-tooth-20-solid"
  >
    <NuxtLink
      v-for="service in lastServices"
      :key="service.id"
      class="px-3 py-2 -mx-2 last:-mb-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 relative"
    >
      <UAvatar
        :src="service.customers.customer_company.logo"
        :alt="service.customers.customer_company.company_name"
        size="md"
      />

      <div class="text-sm flex-1">
        <div>
          <p class="text-gray-900 dark:text-white font-medium">
            {{ service.customers.customer_company.company_name }}
          </p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ service.customers.email }}
          </p>
        </div>
      </div>
      <!-- Status Badge -->
      <UBadge
        :color="getStatusColor(service.servicestatuses.status)"
        variant="solid"
      >
        {{ service.servicestatuses.status }}
      </UBadge>
    </NuxtLink>
  </UDashboardCard>
</template>
