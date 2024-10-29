<script setup lang="ts">
import { ref, computed, defineProps, reactive } from 'vue'
import type { ServiceWithRelations } from '@/types/types'

// Define props for receiving services data
const props = defineProps<{ services: ServiceWithRelations[] }>()

// Columns configuration for UTable
const columns = [
  { key: 'index', label: '#', sortable: true },
  { key: 'service_date', label: 'Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  // { key: 'customer', label: 'Customer', sortable: true },
  { key: 'description', label: 'Description', sortable: false }
]

const selectedStatus = ref<string[]>([]);
const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)))

// Table states
const selectedRows = ref([])
const sort = ref({ column: 'service_date', direction: 'asc' as const })
const page = ref(1)
const pageCount = ref(10)
const pageTotal = computed(() => props.services.length)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

// Status map for color classes
const statusMap = reactive({
  '138261c0-235e-4a19-9b1f-c4ef8afe8529': { label: 'Draft', colorClass: 'bg-gray-400' },
  '656d0181-1aa8-46a0-83d8-651bfd1a4742': { label: 'Completed', colorClass: 'bg-green-500' },
  '681d9cb6-55e4-47a0-9c2c-550674045e04': { label: 'Pending', colorClass: 'bg-yellow-500' },
  '68bd4999-011a-47e3-833d-0f600db5eb48': { label: 'Confirmed', colorClass: 'bg-blue-500' },
  'b3d9ebe7-f348-4fc2-924e-f61256bf13fc': { label: 'New', colorClass: 'bg-indigo-500' },
  'b4e826c6-0b7a-43ed-b5e6-c1d7cc395d28': { label: 'Accounted', colorClass: 'bg-purple-500' },
  'c92998e3-a1b8-43eb-9c8e-74f983db45a9': { label: 'Canceled', colorClass: 'bg-red-500' },
})

// Search and Filter
const search = ref('')
// const filteredServices = computed(() => {
//   return props.services.filter(service =>
//     service.description?.toLowerCase().includes(search.value.toLowerCase())
//   )
// })
// Search and Filter
const filteredServices = computed(() => {
  console.log('selectedStatus:', selectedStatus.value, 'Type:', Array.isArray(selectedStatus.value));

  // Ensure selectedStatus.value is always an array
  const statusArray = Array.isArray(selectedStatus.value) ? selectedStatus.value : [selectedStatus.value];

  return props.services.filter(service => {
    const matchesDescription = service.description?.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = statusArray.length === 0 || statusArray.includes(service.status_id);
    return matchesDescription && matchesStatus;
  });
});

const filterStatus = computed(() => {
  return Object.keys(statusMap).map(key => ({
    value: key,
    label: statusMap[key].label,
  }));
});

// Sorting
const sortedServices = computed(() => {
  const sorted = [...filteredServices.value]
  if (sort.value.column === 'service_date') {
    sorted.sort((a, b) => {
      const dateA = new Date(a.service_date).getTime()
      const dateB = new Date(b.service_date).getTime()
      return sort.value.direction === 'asc' ? dateA - dateB : dateB - dateA
    })
  }
  return sorted
})

// Pagination calculation for current data slice
const paginatedServices = computed(() => {
  const start = (page.value - 1) * pageCount.value
  const end = start + pageCount.value
  return sortedServices.value.slice(start, end)
})

</script>

<template>
  <UCard class="w-full overflow-auto">

  <!-- Filters -->
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search description..." />
      <USelectMenu v-model="selectedStatus" :options="filterStatus" placeholder="Status" class="w-40" />
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

    <!-- Table -->
    <UTable
      v-model="selectedRows"
      v-model:sort="sort"
      :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
      :loading="status === 'pending'"
      :progress="{ color: 'primary', animation: 'carousel' }"
      :rows="paginatedServices"
      :columns="columnsTable"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      sort-mode="manual"
      class="w-full"
      :ui="{ td: { base: 'max-w-[0] truncate' }, default: { checkbox: { color: 'gray' } } }"
    >
      <template #index-data="{ row, index }">
        {{ index + 1 }}
      </template>

      <template #service_date-data="{ row }">
        {{ new Date(row.service_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) }}
      </template>

      <template #status-data="{ row }">
        <span
          v-if="statusMap[row.status_id]"
          :class="`inline-flex items-center px-2 py-1 rounded text-white text-xs font-semibold ${statusMap[row.status_id].colorClass}`">
          {{ statusMap[row.status_id].label }}
        </span>
        <span v-else>Unknown Status</span>
      </template>

      <template #customer-data="{ row }">
        {{ row.customers?.full_name || 'N/A' }}
      </template>

      <template #description-data="{ row }">
        {{ row.description || 'No Description' }}
      </template>
    </UTable>

    <!-- Pagination -->
    <template #footer>
      <div class="flex justify-between items-center">
        <div>
          <span class="text-sm">
            Showing <span class="font-medium">{{ pageFrom }}</span> to <span class="font-medium">{{ pageTo }}</span>
            of <span class="font-medium">{{ pageTotal }}</span> results
          </span>
        </div>
        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="pageTotal"
          class="flex items-center gap-1"
          :ui="{
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: { activeButton: { variant: 'outline' } }
          }"
        />
      </div>
    </template>
  </UCard>
</template>

<style scoped>
@media (max-width: 640px) {
  .UCard {
    padding: 1rem; /* Adjust padding for mobile */
  }
}
</style>
