<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Customers" :badge="customers.length">
        <template #right>
          <UInput
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter services..."
            class="hidden lg:block"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <USelectMenu
            class="ml-2"
            icon="i-heroicons-adjustments-horizontal-solid"
            multiple
          >
            <template #label>Display</template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <div class="p-6">
        <!-- Loading Indicator -->
        <div v-if="loading" class="text-center">
          <span>Loading customers...</span>
        </div>

        <!-- Error Handling -->
        <div v-if="error" class="text-center text-red-500">
          <span>Error: {{ error }}</span>
        </div>

        <!-- Customer Cards Grid -->
        <div
          v-if="customers.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AppCustomersCard
            v-for="customer in customers"
            :key="customer.id"
            :customer="customer"
          />
        </div>

        <!-- No customers message -->
        <div v-else-if="!loading" class="text-center text-gray-500">
          <span>No customers found.</span>
        </div>
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

// Fetch customers using the composable
const { customers, loading, error, fetchCustomers } = useCustomers();

onMounted(() => {
  fetchCustomers();
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
