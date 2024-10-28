<script setup lang="ts">
const { services, loading, error } = useServicesByCustomer()

console.log('Services from composable:', services) // Add this line to check the data
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center">
    Loading...
  </div>
  <div v-else>
    <AppServicesCustomerTable
      v-if="services.length > 0"
      :services="services"
      class="flex-1"
    />
    <div v-else class="text-center">
      No services found.
    </div>
  </div>
  <div v-if="error" class="text-red-500">
    {{ error }}
  </div>
</template>
