<template>
  <UDashboardPage>
    <UDashboardPanel
      grow
      class="overflow-y-auto max-h-[calc(100vh-4rem)]"
    >
      <UDashboardNavbar
        title="Requests"
        class="ml-4"
      >
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
      <div class="p-4 ml-4">
        <AppServicesFormsEditRequest
          :service-types="formattedServiceTypes"
          :statuses="formattedStatuses.value"
          :service-id="serviceId"
          @service-created="handleServiceCreated"
        />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

//

const supabase = useSupabaseClient()
const router = useRouter()
const q = ref('') // Assuming you have a filter value

const { serviceTypes, statuses, fetchServiceTypes, fetchStatuses }
  = useNewService()

// Load service types and statuses
// onMounted(() => {
//   fetchServiceTypes()
//   fetchStatuses()
// })
// Логируем, когда компонент монтируется
onMounted(() => {
  console.log('Component mounted. Fetching service types and statuses...');
  fetchServiceTypes().then(() => {
    console.log('Service types fetched:', serviceTypes.value);
  }).catch(error => {
    console.error('Error fetching service types:', error);
  });

  fetchStatuses().then(() => {
    console.log('Statuses fetched:', statuses.value);
  }).catch(error => {
    console.error('Error fetching statuses:', error);
  });
})

// Define a ref for flights data
const flights = ref([])

// Function to fetch flights data directly in the component
const fetchFlights = async () => {
  const { data, error } = await supabase.from('service_customer_flights').select('*')
  if (error) {
    console.error('Error fetching flights:', error.message)
  } else {
    flights.value = data || []
  }
}
// Fetch data on component mount
onMounted(() => {
  console.log('Component mounted. Fetching service types, statuses, and flights...');

  fetchServiceTypes().catch(error => console.error('Error fetching service types:', error))
  fetchStatuses().catch(error => console.error('Error fetching statuses:', error))

  // Fetch flights data directly in the component
  fetchFlights().catch(error => console.error('Error fetching flights:', error))
})

// Format the service types for USelect component
const formattedServiceTypes = computed(() => {
  return serviceTypes.value.map(type => ({
    label: type.type_name,
    value: type.id
  }))
})

// Format the statuses for USelect component
const formattedStatuses = computed(() => {
  return statuses.value.map(status => ({
    label: status.status,
    value: status.id
  }))
})

const handleServiceCreated = (newServiceId: string) => {
  alert(`Service created with ID: ${newServiceId}`)
  router.push(`/services/requests/${newServiceId}`)
}

const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    },
    {
      label: 'Requests',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: '/services/customers/requests/list'
    }
  ]
]
</script>

<style scoped>
</style>
