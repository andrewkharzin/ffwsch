<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Orders" :badge="orders.length" class="ml-4">
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
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>
      <div>
        <AppOrdersTable :orders="orders" :loading="loading" />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref } from "vue"; // Importing necessary functions
// Fetch orders and loading state
const { orders, loading } = useOrders();
const q = ref(""); // Filter input

const links = [
  [
    {
      label: "home",
      icon: "i-heroicons-home",
      component: "NuxtLink",
      to: `/`,
    },
    {
      label: "Services",
      icon: "i-heroicons-queue-list",
      component: "NuxtLink",
      to: `/services`,
    },
  ],
  [
    {
      label: "Documentation",
      icon: "i-heroicons-book-open",
      to: "https://ui.nuxt.com/pro",
      target: "_blank",
    },
  ],
];
</script>

<style scoped>
/* Add custom styles if needed */
</style>
