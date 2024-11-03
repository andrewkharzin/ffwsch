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

        <!-- Time Field -->
        <!-- <UFormGroup label="Time (HH:MM)">
          <div class="flex space-x-2">
            <UInput
              v-model="hours"
              type="number"
              min="0"
              max="23"
              placeholder="HH"
              class="w-16 text-center"
            />
            <span class="text-gray-500">:</span>
            <UInput
              v-model="minutes"
              type="number"
              min="0"
              max="59"
              placeholder="MM"
              class="w-16 text-center"
            />
          </div>
          <span
            v-if="!isValidTimeFormat"
            class="text-red-500 text-xs"
          >
            Please enter a valid time in HH:MM format.
          </span>
        </UFormGroup> -->

        <!-- Description Field -->
        <UFormGroup
          label="Description"
          required
        >
          <UTextarea
            v-model="form.description"
            color="gray"
            variant="outline"
          />
        </UFormGroup>
        <!-- Flight Field (Conditionally Displayed) -->
        <!-- <UFormGroup
          v-if="showFlightFields"
          label="Flight"
        >
          <UInput
            v-model="form.flight"
            color="primary"
            variant="outline"
            placeholder="Enter flight details"
          />
        </UFormGroup> -->
        <!-- Checkbox to control "Items manager" button visibility -->
        <UFormGroup label="Items add Required?">
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
            Items manager
          </UButton>
        </div>
         <!-- Flight Select Field (conditionally displayed) -->
      <UFormGroup v-if="showFlightFields" label="Flight">
        <USelect v-model="form.customer_flight" :options="flightOptions" placeholder="Select Flight" />
      </UFormGroup>
        <!-- <UFormGroup
          v-if="showFlightFields"
          label="Flight Date & Time"
        >
          <DatePicker
            v-model="form.flight_date_time"
            :default-date="new Date()"
          />
        </UFormGroup> -->

        <!-- Status Field (Read-only) -->
        <UFormGroup label="Status">
          <UInput
            v-model="form.status_id"
            color="primary"
            variant="outline"
            disabled
          />
        </UFormGroup>

        <!-- Submit Button -->
        <!-- Submit Button -->
        <div class="flex space-x-4">
          <!-- "Update" Button: Visible only when `isSent` is false -->
          <UButton
            v-if="!isNew"
            type="submit"
            color="primary"
            variant="soft"
            class="w-full sm:w-auto"
          >
            {{ serviceStore.isEditMode ? 'Update' : 'Add' }}
          </UButton>

          <!-- "Send" Button -->
          <UButton
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

const hours = ref('')
const minutes = ref('')
const isSending = ref(false)
const isValidTimeFormat = ref(true)
const isSent = ref(false)
const cancelStatusId = 'c92998e3-a1b8-43eb-9c8e-74f983db45a9'
const isItemsRequired = ref(false)

const props = defineProps({
  serviceTypes: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  },
  serviceId: {
    type: String,
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
// Computed property to check if selected service type is the specific type
const showFlightFields = computed(() => form.value.service_type_id === '6ecb91d0-f596-4b44-989c-15814b06f337')

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
  console.log('Opening items manager for service ID:', form.value.id);
  // Check if service_id is defined
  if (form.value.id) {
    router.push({ path: `/services/customers/manager/${form.value.id}` });
  } else {
    console.error('Service ID is undefined. Cannot navigate to items manager.')
  }
}
</script>
