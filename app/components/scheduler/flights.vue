<template>
  <UCard class="w-full" :ui="cardUi">
    <!-- Header -->
    <template #header>
      <h2
        class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
      >
        Flights {{ isArrival ? 'Arrivals' : 'Departures' }} at SVO
      </h2>
    </template>

    <!-- Filters -->
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="Search..."
      />
      <USelectMenu
        v-model="selectedStatus"
        :options="statusOptions"
        multiple
        placeholder="Status"
        class="w-40"
      />
    </div>

    <!-- Header and Action buttons -->
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="flex items-center gap-1.5">
        <span class="text-sm leading-5">Rows per page:</span>
        <USelect
          v-model="pageCount"
          :options="[3, 5, 10, 20, 30, 40]"
          class="me-2 w-20"
          size="xs"
        />
      </div>

      <div class="flex gap-1.5 items-center">
        <!-- Toggle Button for Departures/Arrivals -->
        <UToggle
          v-model="isArrival"
          color="primary"
          size="md"
          on-icon="i-heroicons-check-20-solid"
          off-icon="i-heroicons-x-mark-20-solid"
          @update:model-value="toggleFlightType"
        />

        <UButton color="gray" size="sm" @click="toggleFlightType">
          {{ isArrival ? 'Departures' : 'Arrivals' }}
        </UButton>

        <!-- Dropdown and Action Buttons -->
        <UDropdown
          v-if="selectedRows.length > 1"
          :items="actions"
          :ui="{ width: 'w-36' }"
        >
          <UButton
            icon="i-heroicons-chevron-down"
            trailing
            color="gray"
            size="xs"
          >
            Mark as
          </UButton>
        </UDropdown>

        <USelectMenu v-model="selectedColumns" :options="columns" multiple>
          <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
            Columns
          </UButton>
        </USelectMenu>

        <UButton
          icon="i-heroicons-funnel"
          color="gray"
          size="xs"
          :disabled="!isFilterActive"
          @click="resetFilters"
        >
          Reset
        </UButton>
      </div>
    </div>

    <!-- Table -->
    <UTable
      v-model="selectedRows"
      v-model:sort="sort"
      :rows="paginatedFlights"
      :columns="columnsTable"
      :loading="loading"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      sort-mode="manual"
      class="w-full"
      :ui="tableUi"
      @select="select"
    >
      <!-- Custom Renderers -->
      <!-- Replace the #row-number-data with a clickable trigger -->
      <template #airline-data="{ row }">
        <div class="flex items-center space-x-3">
          <div
            class="flex items-center justify-center w-8 h-auto border border-gray-200/40 , rounded-tl-lg rounded-br-lg bg-slate-900 text-gray-200 text-sm font-bold p-2 cursor-pointer"
            @click="fetchFlightDetails(row.number)"
          >
            {{ row.airline.iata }}
          </div>
          <div class="flex flex-col">
            <div class="dark:text-green-400 text-sm font-semibold">
              {{ row.number }}
            </div>
            <div class="text-gray-300 font-bold text-xs">
              {{ row.airline.name }}
            </div>
          </div>
        </div>
      </template>

      <template #aircraft.reg-data="{ row }">
        <div class="flex flex-col">
          <p class="font-bold text-md font-mono text-slate-300">
            {{ row.aircraft.reg }}
          </p>
          <span class="text-tiny text-xs">{{ row.aircraft.model }}</span>
        </div>
      </template>

      <template #movement.scheduledTime.local-data="{ row }">
        <div class="flex flex-col">
          <p class="text-md font-semibold text-red-300 font-mono">
            {{
              row.movement.scheduledTime.local
                ? formatAndLogTime(row.movement.scheduledTime.local)
                : 'N/A'
            }}
          </p>
        </div>
      </template>

      <template #arrival.scheduledTime.local-data="{ row }">
        <div>
          <p class="text-md font-semibold text-red-300 font-mono">
            {{
              row.arrival?.scheduledTime?.local
                ? formatAndLogTime(row.arrival.scheduledTime.local)
                : 'N/A'
            }}
          </p>
        </div>
      </template>

      <template #movement.airport.iata-data="{ row }">
        <div v-if="row.movement && row.movement.airport" class="flex flex-col">
          <div class="flex">
            <span class="text-xs font-bold font-mono">
              {{ row.movement.airport.iata }} {{ ' ' }}|
            </span>
            <span
              class="uppercase ml-2 text-xs font-bold font-mono text-teal-400"
            >
              {{ row.movement.airport.name }}
            </span>
          </div>
          <span class="text-xs font-bold font-mono">
            {{ row.movement.airport.icao }}
          </span>
        </div>
        <div v-else class="flex flex-col">
          <span class="text-xs font-bold font-mono text-gray-500">N/A</span>
          <span class="text-xs font-bold font-mono text-gray-500">N/A</span>
        </div>
      </template>
      <template #status-data="{ row }">
        <span
          :class="[
            'px-2 py-1 rounded-full text-white text-sm font-semibold',
            getStatusClass(row.status),
          ]"
        >
          <UIcon
            v-if="getStatusIcon(row.status)"
            :name="getStatusIcon(row.status)"
            class="text-white"
          />
          {{ row.status }}
        </span>
      </template>

      <template #isCargo-data="{ row }">
        <div>
          <UIcon
            :name="
              row.isCargo ? 'emojione:airplane' : 'emojione-monotone:airplane'
            "
          />
        </div>
      </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <div>
          <span class="text-sm leading-5">
            Showing <span class="font-medium">{{ pageFrom }}</span> to
            <span class="font-medium">{{ pageTo }}</span> of
            <span class="font-medium">{{ pageTotal }}</span> results
          </span>
        </div>
        <UPagination
          v-model="page"
          :page-count="Math.ceil(pageTotal / pageCount)"
          :total="pageTotal"
          :ui="paginationUi"
        />
      </div>
    </template>
    <!-- Slideover Component -->
    <SchedulerSlideFlightDetail
      :modelValue="isOpen"
      :flightDetails="selectedFlightDetails"
      @update:modelValue="isOpen = $event"
      @close="handleClose"
    />
  </UCard>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { formatInTimeZone } from 'date-fns-tz'
import { enUS } from 'date-fns/locale'

// State variables
const isArrival = ref(false) // Toggle state: false -> Departures, true -> Arrivals
const isUtc = ref(false) // For UTC/Local toggle

// // Composable to fetch flights data
// const { flightsData, loading, fetchFlights, pageTotal } = useRapid()
// // Composable to fetch flights data
const {
  flightsData,
  loading,
  fetchFlights,
  fetchFlightInfoByNumber,
  pageTotal,
} = useRapid()

// State variables
const isOpen = ref(false) // State for Slideover visibility
const selectedFlightDetails = ref<any>(null) // Store selected flight details

// Handle close event from Slideover component
const handleClose = () => {
  selectedFlightDetails.value = null
  isOpen.value = false
}

const fetchCurrentFlights = () => {
  const iataCode = 'SVO' // Use a valid IATA code here
  fetchFlights(iataCode)
}

const toggleFlightType = () => {
  console.log('Toggling flight type. Current state:', isArrival.value)
  isArrival.value = !isArrival.value
  console.log('New state:', isArrival.value)
  fetchCurrentFlights()
}

onMounted(() => {
  fetchCurrentFlights()
})

// Utility function to format time
const formatAndLogTime = (timeString: string) => {
  const date = new Date(timeString)
  const formatString = 'dd/MM | HH:mm '
  const timeZone = isUtc.value
    ? 'UTC'
    : Intl.DateTimeFormat().resolvedOptions().timeZone
  return formatInTimeZone(date, timeZone, formatString)
}

// UI configurations
const cardUi = {
  base: '',
  ring: '',
  divide: 'divide-y divide-gray-200 dark:divide-gray-700',
  header: { padding: 'px-4 py-5' },
  body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
  footer: { padding: 'p-4' },
}

const tableUi = {
  td: { base: 'max-w-[0] truncate' },
  default: { checkbox: { color: 'gray' } },
}

const paginationUi = {
  wrapper: 'flex items-center gap-1',
  rounded: '!rounded-full min-w-[32px] justify-center',
  default: { activeButton: { variant: 'outline' } },
}

// Columns for the table
const columns = ref([
  { key: 'airline', label: 'Airline', sortable: false },
  { key: 'aircraft.reg', label: 'Registration', sortable: false },
  {
    key: 'movement.scheduledTime.local',
    label: 'Dep/Time',
    sortable: true,
  },
  // { key: 'arrival.scheduledTime.local', label: 'Arr/Time', sortable: true },
  { key: 'movement.airport.iata', label: 'Dest/IATA', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'isCargo', label: 'Cargo', sortable: false },
])

const selectedColumns = ref(columns.value.map((col) => col.key))
const selectedStatus = ref<string[]>([])
const search = ref('')
const page = ref(1)
const pageCount = ref(20)
const sort = ref<{ key: string; order: 'asc' | 'desc' }>({
  key: 'departure.scheduledTime.local',
  order: 'asc',
})
const selectedRows = ref<any[]>([])

const filteredFlights = computed(() => {
  const data = isArrival.value
    ? flightsData.value.arrivals
    : flightsData.value.departures

  let filtered = Array.isArray(data) ? data : []

  if (selectedStatus.value.length) {
    filtered = filtered.filter((flight) =>
      selectedStatus.value.includes(flight.status)
    )
  }

  if (search.value) {
    filtered = filtered.filter((flight) =>
      Object.values(flight).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(search.value.toLowerCase())
      )
    )
  }

  return filtered
})

// Pagination
const paginatedFlights = computed(() => {
  const start = (page.value - 1) * pageCount.value
  return Array.isArray(filteredFlights.value)
    ? filteredFlights.value.slice(start, start + pageCount.value)
    : []
})

const pageFrom = computed(() =>
  Math.min((page.value - 1) * pageCount.value + 1, filteredFlights.value.length)
)
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, filteredFlights.value.length)
)

// Column configuration based on departure/arrival toggle
const columnsTable = computed(() => {
  return columns.value.filter((col) => selectedColumns.value.includes(col.key))
})

// Actions for dropdown
const actions = [
  { label: 'As on Time', icon: 'i-heroicons-clock-20-solid' },
  { label: 'As Cancelled', icon: 'i-heroicons-x-circle-20-solid' },
  { label: 'As Delayed', icon: 'i-heroicons-exclamation-circle-20-solid' },
]

// Method to get the appropriate class based on flight status
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Departed':
      return 'bg-green-600'
    case 'Canceled':
      return 'bg-gray-600'
    case 'Boarding':
      return 'bg-pink-500'
    case 'EnRoute':
      return 'bg-green-800'
    case 'CheckIn':
      return 'bg-sky-600'
    case 'Arrived':
      return 'bg-slate-300 uppercase font-bold flex items-center space-x-1'
    default:
      return 'bg-gray-400'
  }
}

// Method to get the appropriate icon based on flight status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Arrived':
      return 'mdi-airplane-landing' // Example icon name for Arrived status
    default:
      return null // No icon for other statuses
  }
}

// Fetch flight details on row click
const fetchFlightDetails = async (flightNumber: string) => {
  const flightDetails = await fetchFlightInfoByNumber(flightNumber)
  selectedFlightDetails.value = flightDetails
  isOpen.value = true // Open the slideover
}

// Reset filters
const resetFilters = () => {
  search.value = ''
  selectedStatus.value = []
  page.value = 1
}

watch(isArrival, () => {
  page.value = 1 // Reset to first page on toggle change
  fetchCurrentFlights()
})
</script>
