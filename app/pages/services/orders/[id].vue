<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Order Detail" class="ml-2">
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
      <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <div class="mt-2 grid grid-cols-1 sm:grid-cols-1 gap-1">
        <div class="p-4 w-full">
          <!-- Loading Spinner -->
          <div v-if="loading" class="flex justify-center">
            <ULoader size="lg" />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-500">
            <p>{{ error }}</p>
          </div>

          <!-- Service Order Details -->
          <div
            v-if="!loading && serviceOrderDetail"
            class="flex flex-col space-y-2"
          >
            <UDashboardCard>
              <div class="flex flex-col">
                <UDashboardSection
                  icon="i-heroicons-sparkles"
                  title="Order №"
                  :description="serviceOrderDetail.serial_number"
                  orientation="vertical"
                  class="px-4 mt-6"
                  size="sm"
                />
                <UDashboardSection
                  icon="i-heroicons-calendar"
                  title="Date"
                  :description="serviceOrderDetail.order_date"
                  orientation="vertical"
                  class="px-4 mt-6"
                  size="sm"
                />
              </div>
            </UDashboardCard>
            <!-- Related Service Info -->
            <h4 class="text-md font-medium text-gray-600">Service Info</h4>
          </div>
        </div>
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { formatDate } from "../../../utils/date/date"; // Adjust path if necessary

// Extract serviceId from route params
const route = useRoute();
const serviceId = route.params.id;

console.log("Service ID:", serviceId); // Log Service ID

// Use the useServiceOrder composable
const { serviceOrderDetail, loading, error, fetchServiceOrderWithDetails } =
  useServiceOrder();

// Fetch service order details when the component is mounted
onMounted(() => {
  console.log("Component mounted!"); // Log when component mounts
  fetchServiceOrderWithDetails(serviceId);
});

// Computed property to determine the status color based on the status value
const statusClass = computed(() => {
  if (!serviceOrderDetail.value) return ""; // Return empty string if data not available

  switch (serviceOrderDetail.value.status) {
    case "Pending":
      return "text-orange-500"; // Apply orange text color for Pending status
    case "Completed":
      return "text-green-500"; // Apply green text color for Completed status
    case "Cancelled":
      return "text-red-500"; // Apply red text color for Cancelled status
    default:
      return "text-gray-500"; // Default gray color for other statuses
  }
});

const links = [
  [
    {
      label: "home",
      icon: "i-heroicons-home",
      component: "NuxtLink",
      to: `/`,
    },
    {
      label: "Orders",
      icon: "i-heroicons-queue-list",
      component: "NuxtLink",
      to: `/services/orders`,
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
