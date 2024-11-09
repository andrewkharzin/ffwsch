<script setup lang="ts">
import { ref, computed, watch } from 'vue' // Import your composable
import type { ServiceWithRelations } from '@/types/types'

// Use composable to get services
const { services, loading, error } = useServicesByCustomer()

// Filters and columns
const search = ref('')
const selectedStatus = ref<string>('All')
const columns = [
  { key: 'index', label: '#', sortable: true },
  { key: 'service_date', label: 'Date', sortable: true },
  { key: 'service_type', label: 'Service Type', sortable: true },
  { key: 'flight', label: 'Flight', sortable: false },
  { key: 'status', label: 'Status', sortable: true }
]

// Status map definition
const statusConfig = {
  '138261c0-235e-4a19-9b1f-c4ef8afe8529': { label: 'Draft', colorClass: 'bg-gray-400' },
  '656d0181-1aa8-46a0-83d8-651bfd1a4742': { label: 'Completed', colorClass: 'bg-green-500' },
  '681d9cb6-55e4-47a0-9c2c-550674045e04': { label: 'Pending', colorClass: 'bg-yellow-500' },
  '68bd4999-011a-47e3-833d-0f600db5eb48': { label: 'Confirmed', colorClass: 'bg-teal-600' },
  'b3d9ebe7-f348-4fc2-924e-f61256bf13fc': { label: 'New', colorClass: 'bg-indigo-500' },
  'b4e826c6-0b7a-43ed-b5e6-c1d7cc395d28': { label: 'Accounted', colorClass: 'bg-purple-500' },
  'c92998e3-a1b8-43eb-9c8e-74f983db45a9': { label: 'Canceled', colorClass: 'bg-red-500' },
  '23fafe3b-0632-4060-8557-3b703ed22186': { label: 'Rejected', colorClass: 'bg-pink-600' }
}

const computedStatusMap = computed(() => {
  // Force reactivity by recalculating the map whenever `services` changes
  return services.value.reduce((map, service) => {
    map[service.id] = statusConfig[service.status_id] || { label: 'Unknown Status', colorClass: 'bg-gray-200' }
    return map
  }, {} as Record<string, { label: string; colorClass: string }>)
})

// Filter options for statuses
const filterStatusOptions = [
  { value: 'All', label: 'All' },
  ...Object.keys(statusConfig).map(key => ({
    value: key,
    label: statusConfig[key].label
  }))
]

// Computed filtered services based on search and selected status
const filteredServices = computed(() => {
  const statusValue = selectedStatus.value || 'All'
  return services.value.filter((service) => {
    const matchesDescription = search.value === '' || service.description?.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusValue === 'All' || service.status_id === statusValue
    return matchesDescription && matchesStatus
  })
})

// Watch filters and log changes for debugging
watch([search, selectedStatus], () => {
  console.log('Filters changed:')
  console.log('Current search:', search.value)
  console.log('Selected status:', selectedStatus.value)
  console.log('Filtered data:', filteredServices.value)
}, { immediate: true })

watch(services, (newVal) => {
  console.log('Updated services array:', newVal)
})
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <UInput
      v-model="search"
      icon="i-heroicons-magnifying-glass-20-solid"
      placeholder="Search description..."
    />
    <USelectMenu
      v-model="selectedStatus"
      :options="filterStatusOptions"
      placeholder="Status"
      class="w-40"
    />
    <NuxtLink to="/services/requests/new">
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        color="primary"
        square
        variant="solid"
      />
    </NuxtLink>
  </div>

  <!-- Table with filtered services -->
  <UTable
    :rows="filteredServices"
    :columns="columns"
    :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
    class="w-full"
  >
    <template #index-data="{ row, index }">
      {{ index + 1 }}
    </template>

    <template #service_date-data="{ row }">
      <NuxtLink :to="`/services/requests/${row.id}`">
        <UButton
          variant="ghost"
          size="xs"
          color="primary"
          :disabled="!row.service_date"
          class="text-sm font-bold"
        >
          {{ row.service_date ? new Date(row.service_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' }}
        </UButton>
      </NuxtLink>
    </template>

    <template #service_type-data="{ row }">
      {{ row.servicetype.type_name || 'No Type' }}
    </template>

    <template #flight-data="{ row }">
      <p class="text-sm font-bold dark:text-teal-500">
        {{ row.service_customer_flights?.flight_number }}{{ " " }}
        <span class="text-sm font-light dark:text-gray-600">/</span>
        <span class="text-sm font-light dark:text-gray-500">{{ row.service_customer_flights?.flight_pst }}</span>
      </p>
    </template>

    <!-- Reactive status display -->
    <template #status-data="{ row }">
      <span
        v-if="computedStatusMap[row.id]"
        :key="row.id"
        :class="`inline-flex items-center px-2 py-1 rounded text-white text-xs font-semibold ${computedStatusMap[row.id].colorClass}`"
      >
        {{ computedStatusMap[row.id].label }}
      </span>
      <span v-else>Unknown Status</span>
    </template>

    <template #description-data="{ row }">
      {{ row.description || 'No Description' }}
    </template>
  </UTable>
</template>
