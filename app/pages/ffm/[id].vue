<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Awbs"
        :badge="ffmTelexRecords.length"
        class="ml-4"
      />
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>
      <UCard
        class="w-full"
        :ui="{ header: { padding: 'px-4 py-5' }, body: { padding: '' } }"
      >
        <template #header />

        <!-- Table -->
        <UTable
          v-if="!pending"
          :rows="ffmTelexRecords"
          :columns="columns"
          class="w-full p-4 mx-auto"
          :ui="{ td: { base: 'truncate' }, default: { checkbox: { color: 'gray' as any } } }"
        >
          <template #flight-data="{ row }">
            <span class="text-md dark:text-sky-500 font-bold">{{ row.flight }}</span>
          </template>
          <template #actions-data="{ row }">
            <UDropdown :items="items(row)">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </template>
          <template #awb_carrier-data="{ row }">
            <p class="font-bold font-mono dark:text-teal-400">
              {{ row.awb_carrier }} {{ " - " }}
              <span class="dark:text-gray-400 racking-wide"> {{ row.awb_number }}</span>
            </p>
          </template>
        </UTable>

        <!-- Loading Indicator -->
        <div
          v-if="pending"
          class="flex justify-center items-center py-6"
        >
          <span>Loading...</span>
        </div>
      </UCard>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const route = useRoute()
const { ffmTelexRecords, pending, fetchFfmTelexRecords } = useFfmDetail()

// Table columns
const columns = [
  { key: 'flight', label: 'Flight' },
  { key: 'awb_carrier', label: 'AWB' },
  { key: 'number_pcs', label: 'Pieces' },
  { key: 'weight', label: 'Weight' },
  { key: 'volume', label: 'Volume' },
  { key: 'shipping_name', label: 'Shipping Name' },
  { key: 'shc', label: 'SHC' },
  { key: 'actions', label: 'Actions' }
]

// Fetch data on mount
onMounted(() => {
  const ffmId = route.params.id as string
  fetchFfmTelexRecords(ffmId)
})

const items = row => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => console.log('Edit', row.id)
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate-20-solid'
  }], [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid'
  }, {
    label: 'Move',
    icon: 'i-heroicons-arrow-right-circle-20-solid'
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid'
  }]
]

const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    },
    {
      label: 'List',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: '/ffm'
    },
    {
      label: 'Paylod',
      icon: 'i-heroicons-queue-list'
    }
  ]
]
</script>

<style scoped>
/* Add any additional styling here if needed */
</style>
