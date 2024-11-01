<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Requests" class="ml-4">
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
          :serviceTypes="formattedServiceTypes"
          :statuses="formattedStatuses"
          @serviceCreated="handleServiceCreated"
        />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})


const router = useRouter()
const q = ref('') // Assuming you have a filter value

const { serviceTypes, statuses, fetchServiceTypes, fetchStatuses } =
  useNewService()

// Load service types and statuses
onMounted(() => {
  fetchServiceTypes()
  fetchStatuses()
})

// Format the service types for USelect component
const formattedServiceTypes = computed(() => {
  return serviceTypes.value.map((type) => ({
    label: type.type_name,
    value: type.id
  }))
})

// Format the statuses for USelect component
const formattedStatuses = computed(() => {
  return statuses.value.map((status) => ({
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
</style>
