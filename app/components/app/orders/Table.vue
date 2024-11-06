<template>
  <UCard class="w-full">
    <template #header />

    <UTable
      v-model="selectedRows"
      v-model:sort="sort"
      :rows="formattedOrders"
      :columns="columns"
      :loading="loading"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      sort-mode="manual"
      class="w-full"
    >
      <!-- Status Column -->
      <template #status-data="{ row }">
        <UBadge
          size="xs"
          :label="row.status"
          :color="row.status === 'Completed' ? 'emerald' : 'orange'"
          variant="subtle"
        />
      </template>

      <!-- Order Date Column with Serial Number Truncated -->
      <template #order_date-data="{ row }">
        <div class="flex flex-col">
          <p>{{ row.order_date }}</p>
          <div class="overflow-hidden">
            <NuxtLink to="/services/orders/${row.service_id}">
              <span
                class="text-sm cursor-pointer hover:text-pink-600 hover:font-bold"
              >
                {{ row.serial_number.substring(0, 18) }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </template>

      <!-- Actions Column with Dropdown Menu -->
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
        </UDropdown>
      </template>
    </UTable>
  </UCard>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps } from 'vue'
import { formatDate } from '../../../utils/date/date' // Adjust the import path as necessary

// Define props to receive from the parent component
const props = defineProps<{
  orders: Array<{
    id: string
    service_id: string // Add service_id to the props for each order
    order_date: string
    serial_number: string
    total_amount: number
    status: string
  }>
  loading: boolean
}>()

const selectedRows = ref([])

// Update the items function to pass the service_id for "Details"
const items = row => [
  [
    {
      label: 'Details',
      icon: 'i-heroicons-eye',
      component: 'NuxtLink',
      to: `/services/orders/${row.service_id}` // Redirect to the order detail page using service_id
    },
    {
      label: 'Duplicate',
      icon: 'i-heroicons-document-duplicate-20-solid'
    }
  ],
  [
    {
      label: 'Archive',
      icon: 'i-heroicons-archive-box-20-solid'
    },
    {
      label: 'Move',
      icon: 'i-heroicons-arrow-right-circle-20-solid'
    }
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid'
    }
  ]
]

// Computed property to format the orders safely
const formattedOrders = computed(() => {
  if (!Array.isArray(props.orders)) {
    return []
  }
  return props.orders.map(order => ({
    ...order,
    order_date: formatDate(order.order_date)
  }))
})

// Define the columns for the table
const columns = [
  { key: 'order_date', label: 'Order Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]
</script>
