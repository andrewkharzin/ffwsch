<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Details" class="ml-4">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter requests..."
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
      <UCard class="p-4 ml-2">
        <div v-if="loading" class="flex justify-center items-center min-h-screen">
          <p>Loading...</p>
        </div>
        <div v-else>
          <div v-if="error" class="text-red-500">
            <p>{{ error }}</p>
          </div>
          <div v-else>
            <div class="flex flex-col space-y-4">
              <UPageCard
                  title="Tailwind CSS"
                  :description="serviceData.description"
                  icon="i-simple-icons-tailwindcss"
                />
              <!-- <UFormGroup label="Title">
                  <p class="text-md font-normal text-gray-300">Test title</p>
              </UFormGroup> -->
              <!-- <UBlogPost
                title="TEST REQUEST"
                :description="serviceData.description"
                :date="serviceData.service_date"
                orientation="vertical"
                :authors="serviceData.customers.full_name"
                :badge="serviceData.servicestatuses.status"
              /> -->

            </div>
            <div class="mt-4">
              <h2 class="text-sm font-light text-gray-500">Date:</h2>
              <p class="text-sm font-mono font-bold text-gray-400">{{ serviceData.service_date }}</p>
            </div>

            <div class="mt-4">
              <h2 class="text-sm font-light text-gray-500">Time:</h2>
              <p class="text-sm font-mono font-bold text-gray-400">{{ serviceData.service_time }}</p>
            </div>

            <div class="mt-2">
              <h2 class="text-sm font-light text-gray-500">Customer Information:</h2>
              <p><strong>Name:</strong> {{ serviceData.customers.full_name }}</p>
              <p>
                <strong>Company:</strong>
                {{ serviceData.customers.company_id.company_name }}
              </p>
            </div>
            <div class="mb-4">
              <h2 class="font-semibold">Status:</h2>
              <p>{{ serviceData.servicestatuses.status }}</p>
            </div>

            <div class="mb-4">
              <h2 class="font-semibold">Service Order:</h2>
              <p>{{ serviceData.service_orders.serial_number }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup>
const route = useRoute()
const { id } = route.params
const { serviceData, loading, error } = useServiceById(id)
const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: `/`
    },
    {
      label: 'Requests',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: `/services/customers/requests/list`
    }
  ]
]
</script>

<style scoped>
/* Add any styling you may want */
</style>
