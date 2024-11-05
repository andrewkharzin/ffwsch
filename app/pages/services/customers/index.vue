<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Users"
        :badge="customers.length"
        class="ml-2"
      >
        <!-- Input for filtering users -->
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter users..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
        </template>
      </UDashboardNavbar>

      <div class="p-6">
        <!-- Only show skeletons while loading -->
        <div
          v-if="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AppCustomersCardSkeleton
            v-for="n in 6"
            :key="n"
          />
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="text-center text-red-500"
        >
          <span>Error: {{ error }}</span>
        </div>

        <!-- Show customer cards only when loading is false -->
        <div
          v-if="!loading && customers.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AppCustomersCard
            v-for="customer in customers"
            :key="customer.id"
            :customer="customer"
          />
        </div>

        <!-- No customers message when no data found -->
        <div
          v-else-if="!loading && !customers.length"
          class="text-center text-gray-500"
        >
          <span>No customers found.</span>
        </div>
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const loading = ref(true) // Manage loading state
const delay = 2000 // 2-second delay for skeletons

// Fetch customers using the composable
const { customers, error, fetchCustomers } = useCustomers()

// onMounted(() => {
//   fetchCustomers();
// });

// Fetch customers when component is mounted
onMounted(() => {
  // Fetch customers data
  fetchCustomers()
    .then(() => {
      // Apply delay to simulate loading
      setTimeout(() => {
        loading.value = false // Stop showing skeletons after delay
      }, delay)
    })
    .catch(() => {
      loading.value = false // Stop loading if there's an error
    })
})
</script>

<style scoped>
/* Add custom styles if needed */
</style>
