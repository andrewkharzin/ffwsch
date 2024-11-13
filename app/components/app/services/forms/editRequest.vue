<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col space-y-4">
        <!-- Date Field -->
        <UFormGroup
          label="Date"
          required
        >
          <UPopover :popper="{ placement: 'bottom-start' }">
            <UButton
              icon="i-heroicons-calendar-days-20-solid"
              :label="formattedDate"
            />
            <template #panel="{ close }">
              <DatePicker
                v-model="form.service_date"
                :default-date="new Date()"
                is-required
                @close="close"
                @dayclick="handleDayClick"
              />
            </template>
          </UPopover>
        </UFormGroup>

        <!-- Display Selected Service Type as Text Above the Select Field -->
        <div>
          <span
            v-if="selectedServiceType"
            class="block text-sm text-gray-500"
          >
            Selected Service Type: {{ selectedServiceType.label }}
          </span>
          <UFormGroup
            label="Service Type"
            required
          >
            <USelect
              v-model="form.service_type_id"
              color="primary"
              variant="outline"
              :options="formattedServiceTypes"
              placeholder="Select Service Type"
              required
            />
          </UFormGroup>
        </div>

        <Tiptap v-model="form.description" />
        <!-- Checkbox to control "Items manager" button visibility -->
        <UFormGroup
          v-if="showFlightFields && !isConfirmedOrRejected"
          label="Items add Required?"
        >
          <UCheckbox
            v-model="isItemsRequired"
            color="primary"
          />
        </UFormGroup>

        <!-- Conditionally render the "Items manager" button -->
        <div
          v-if="isItemsRequired"
          class="flex space-x-4"
        >
          <UButton
            color="primary"
            variant="soft"
            @click="openItemsManager"
          >
            FKIT MANAGER
          </UButton>
        </div>
        <!-- Flight Select Field (conditionally displayed) -->
        <UFormGroup
          v-if="showFlightFields"
          class="text-sm font-light tracking-wider"
        >
          <USelect
            v-model="form.customer_flight"
            :options="serviceStore.flightOptions"
            placeholder="Select Flight"
            disabled
            color="gray"
            class="text-lg font-black dark:text-teal-500 font-mono"
          />
        </UFormGroup>
        <!-- Flight Search Field (conditionally displayed) -->
        <UFormGroup
          v-if="showFlightFields"
        >
          <!-- "GetFlightChildComponent" -->
          <AppServicesFormsGetFlight
            v-if="!isConfirmedOrRejected"
            v-model="form.customer_flight"
            :flight-query="flightQuery"
            @input="handleFlightSearch"
            @select-flight="updateFlightSelection"
          />
          <!-- Live current flight -->

          <!-- Display flight data -->
          <!-- <div v-if="flightsData">
            <p>Arrival: {{ flightsData.arrivals[0]?.destination }}</p>
            <p>Departure: {{ flightsData.departures[0]?.origin }}</p>
          </div> -->
        </UFormGroup>

        <!-- Status Field (Read-only) -->
        <div class="flex flex-row">
          <div class="flex-row-reverse">
            <UBadge
              color="teal"
              variant="soft"
            >
              {{ statusText }}
            </UBadge>
          </div>
        </div>
        <!-- Submit Button -->
        <!-- <div class="flex space-x-4">
          <UButton
            v-if="!isNew"
            type="submit"
            color="primary"
            variant="soft"
            class="w-full sm:w-auto"
          >
            {{ serviceStore.isEditMode ? 'Update' : 'Add' }}
          </UButton>
          <UButton
            color="rose"
            variant="soft"
            :loading="serviceStore.isSending"
            class="w-full sm:w-auto"
            @click="sendService"
          >
            {{ serviceStore.service.status_id === serviceStore.statusIds.new ? 'Cancel' : 'Send' }}
          </UButton>
        </div> -->
        <!-- Submit Button -->
        <div class="flex space-x-4">
          <!-- "Update" Button: Visible only when `isSent` is false and not Confirmed/Rejected -->
          <UButton
            v-if="!isNew && !isConfirmedOrRejected"
            type="submit"
            color="primary"
            variant="soft"
            class="w-full sm:w-auto"
          >
            {{ serviceStore.isEditMode ? 'Update' : 'Add' }}
          </UButton>

          <!-- "Send" Button: Hidden when Confirmed/Rejected -->
          <UButton
            v-if="!isConfirmedOrRejected"
            color="rose"
            variant="soft"
            :loading="serviceStore.isSending"
            class="w-full sm:w-auto"
            @click="sendService"
          >
            {{ serviceStore.service.status_id === serviceStore.statusIds.new ? 'Cancel' : 'Send' }}
          </UButton>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useServiceStore } from '../../../../stores/serviceStore'

const serviceStore = useServiceStore()
const route = useRoute()
const router = useRouter() // Get the router instance
const toast = useToast()

const { flightsData, fetchFlightInfoByNumber } = useRapid()
const { statuses, fetchStatuses } = useStatuses()
fetchStatuses()

// The current flight search query
const q = ref('')

const hours = ref('')
const minutes = ref('')
const isSending = ref(false)
const isValidTimeFormat = ref(true)
const isSent = ref(false)
const cancelStatusId = 'c92998e3-a1b8-43eb-9c8e-74f983db45a9'
const isItemsRequired = ref(false)

const props = defineProps({
  serviceId: {
    type: String, // Используем String для UUID
    required: true // Если это обязательный пропс
  },
  serviceTypes: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  }
})

const form = ref({
  service_type_id: '',
  service_date: '',
  service_time: '',
  description: '',
  status_id: '',
  user_id: '',
  flight: '', // New flight field
  flight_date_time: '',
  customer_flight: null
})

// Computed property to find the status text by ID
const statusText = computed(() => {
  const status = statuses.value.find(s => s.id === form.value.status_id)
  return status ? status.status : 'Unknown Status'
})

function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

let cachedFlightsData: any = null

const fetchFlightsDebounced = debounce(async (iataCode: string) => {
  if (cachedFlightsData) {
    flightsData.value = cachedFlightsData
    return
  }

  await fetchFlights(iataCode)
  cachedFlightsData = flightsData.value // Store result in cache
}, 500) // Debounce for 500ms

onMounted(() => {
  fetchFlightsDebounced('SVO')
})

const updateFlightSelection = (flightId) => {
  form.value.customer_flight = flightId // Update form with selected flight ID
}

// All available flights from the database
// const flights = ref([])
// Computed property to check if selected service type is the specific type
// const showFlightFields = computed(() => form.value.service_type_id === '6ecb91d0-f596-4b44-989c-15814b06f337')

// Проверка на статус
const isDraft = computed(() => form.value.status_id === '138261c0-235e-4a19-9b1f-c4ef8afe8529')
const isNew = computed(() => form.value.status_id === 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc')
// Validation function for time format
const validateTimeFormat = () => {
  const h = parseInt(hours.value)
  const m = parseInt(minutes.value)

  isValidTimeFormat.value = !isNaN(h) && !isNaN(m) && (h >= 0 && h <= 23) && (m >= 0 && m <= 59)
}

watch([hours, minutes], validateTimeFormat)

const handleSendOrCancel = async () => {
  if (serviceStore.service.status_id === serviceStore.statusIds.new) {
    // Здесь логика для отмены, если статус New
    await serviceStore.cancelService() // Пример, если нужно реализовать логику отмены
    toast.add('Service has been canceled', {
      color: 'warning',
      duration: 5000,
      position: 'top-center'
    })
  } else {
    await submitForm()
  }
}

onMounted(async () => {
  const serviceId = route.params.id
  try {
    const serviceData = await serviceStore.fetchServiceById(serviceId)
    if (serviceData) {
      form.value = { ...serviceData }
      if (serviceData.service_time) {
        const [loadedHours, loadedMinutes] = serviceData.service_time.split(':')
        hours.value = loadedHours || '00'
        minutes.value = loadedMinutes || '00'
      }
      isDraft.value = form.value.status_id === 'Draft' // Set isDraft based on initial status
    }
  } catch (error) {
    console.error('Error fetching service data:', error)
    toast.add('Failed to load service data', {
      color: 'error',
      duration: 5000,
      position: 'top-center'
    })
  }
  serviceStore.loadFlightOptions()
})

const formattedServiceTypes = computed(() => props.serviceTypes)

const submitForm = async () => {
  try {
    const validHours = String(hours.value || '00').padStart(2, '0')
    const validMinutes = String(minutes.value || '00').padStart(2, '0')
    form.value.service_time = `${validHours}:${validMinutes}`

    if (!isValidTimeFormat.value) {
      toast.add({ title: 'Invalid Time Format', description: 'Please enter a valid time in HH:MM format.', color: 'error' })
      return
    }

    await serviceStore.updateService(form.value)
    toast.add({ title: 'Service Updated', description: 'Your service was updated successfully.', color: 'success' })

    // Update isDraft state if status changes to 'New'
    if (form.value.status_id === 'New') {
      isDraft.value = false
    }
  } catch (error) {
    console.error('Error updating service:', error)
    toast.add({ title: 'Update Failed', description: 'Error updating service. Please try again.', color: 'error' })
  }
}

const sendService = async () => {
  if (isDraft.value) {
    try {
      isSending.value = true

      // Update status to "New"
      form.value.status_id = 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc' // ID for "New"
      await serviceStore.updateService(form.value)

      // Show success toast notification
      toast.add({
        title: 'Service Send',
        description: 'Your service was send successfully, waiting form manager response! or ( CALL EMRG +7923458998239)',
        icon: 'i-octicon-desktop-download-24',
        color: 'primary'
      })

      // Set "sent" state
      isSent.value = true
    } catch (error) {
      console.error('Error sending service:', error)

      // Show error toast notification
      toast.add({
        title: 'Update Failed',
        description: 'Error updating service. Please try again.',
        color: 'error'
      })
    } finally {
      isSending.value = false // Stop the loading indicator
    }
  } else if (isNew.value) {
    // Logic for cancellation if status is "New"
    // Add cancellation logic here if needed
  }
}
const openItemsManager = () => {
  // console.log('Opening items manager for service ID:', form.value.service_id) // Debugging log
  console.log('Opening items manager for service ID:', form.value.id)
  // Check if service_id is defined
  if (form.value.id) {
    router.push({ path: `/services/customers/manager/${form.value.id}` })
  } else {
    console.error('Service ID is undefined. Cannot navigate to items manager.')
  }
}

// When the search query changes, this will trigger filtering
// const onSearchUpdate = (value: string) => {
//   q.value = value
// }

// Flight search query
const flightQuery = ref('')
const { flights, loading, error, fetchFlights } = useServiceCustomerFlights()

// Watch `flightQuery` and fetch flights whenever it changes
watch(flightQuery, async (newQuery) => {
  if (newQuery.trim()) {
    await fetchFlights(newQuery)
  }
})
// Filter flights based on search query
const filteredFlights = computed(() => {
  return flightQuery.value
    ? flights.value.filter(flight =>
      flight.flight_number.toLowerCase().includes(flightQuery.value.toLowerCase())
    )
    : []
})

// Show flight fields based on service type
const showFlightFields = computed(() => form.value.service_type_id === '6ecb91d0-f596-4b44-989c-15814b06f337')

const handleFlightSearch = async () => {
  if (flightQuery.value) await fetchFlightInfoByNumber(flightQuery.value)
  const flightNumber = 'N4080' // Убедитесь, что используется корректный номер
  await fetchFlightInfoByNumber(flightNumber)
}
// Select a flight and set it in the form
const selectFlight = (flight) => {
  form.value.customer_flight = flight.id
  flightQuery.value = `${flight.flight_number}`
}


// Assuming these are the UUIDs for "Confirmed" and "Rejected"
const confirmedStatusId = '68bd4999-011a-47e3-833d-0f600db5eb48';
const rejectedStatusId = '23fafe3b-0632-4060-8557-3b703ed22186';

const isConfirmedOrRejected = computed(() => {
  return form.value.status_id === confirmedStatusId || form.value.status_id === rejectedStatusId;
});
</script>

<style scoped>
.live-flight-info {
  border: 1px solid #4caf50;
  padding: 10px;
  background-color: #e8f5e9;
}
.live-icon {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
