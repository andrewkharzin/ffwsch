<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex-auto w-full">
            <UFormGroup label="Date" required>
              <UPopover :popper="{ placement: 'bottom-start' }">
                <UButton
                  icon="i-heroicons-calendar-days-20-solid"
                  :label="
                    date
                      ? format(new Date(date), 'd MMM, yyyy')
                      : format(new Date(), 'd MMM, yyyy')
                  "
                />
                <template #panel="{ close }">
                  <DatePicker
                    v-model="date"
                    :default-date="new Date()"
                    is-required
                    @close="close"
                  />
                </template>
              </UPopover>
            </UFormGroup>
          </div>

          <div class="flex-auto w-full">
            <UFormGroup label="Time" required>
              <UiTimePicker
                v-model="form.service_time"
                @change="handleTimeChange"
              />
            </UFormGroup>
          </div>
        </div>

        <div class="w-full col-span-2 sm:col-span-1">
          <UFormGroup label="Description">
            <UTextarea
              v-model="form.description"
              color="gray"
              variant="outline"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Service Type" required>
          <USelect
            v-model="form.service_type_id"
            color="primary"
            variant="outline"
            :options="formattedServiceTypes"
            placeholder="Select Service Type"
            required
          />
        </UFormGroup>

        <UFormGroup label="Status" required>
          <UInput
            v-model="form.status_id"
            color="primary"
            variant="outline"
            :disabled="true"
          />
        </UFormGroup>

        <div class="w-full">
          <UButton
            type="submit"
            color="primary"
            variant="soft"
            class="w-full sm:w-auto"
          >
            {{ isEditMode ? 'Send' : 'Submit' }}
            <!-- Dynamic button label -->
          </UButton>
        </div>
      </div>
    </div>
  </form>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useServiceStore } from '../../../../stores/serviceStore' // Ensure correct path

const props = defineProps({
  serviceTypes: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['serviceCreated'])
const date = ref(new Date())
const serviceStore = useServiceStore() // Using Pinia store

const form = ref({
  service_type_id: '',
  service_date: new Date().toISOString().split('T')[0],
  service_time: '',
  description: '',
  status_id: 'Draft', // Default status for new entries
  user_id: ''
})

const user = useSupabaseUser()

// Computed property to determine if in edit mode
const isEditMode = computed(() => serviceStore.isEditMode)

// Watch the service store to update the form when in edit mode
watch(
  () => serviceStore.service,
  (newService) => {
    if (newService) {
      form.value = { ...newService }
      date.value = newService.service_date // Update date
    }
  },
  { immediate: true }
)

// Format the service types for USelect component
const formattedServiceTypes = computed(() => props.serviceTypes)

// Handle time changes
const handleTimeChange = (selectedTime) => {
  if (selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
    form.value.service_time = selectedTime.toLocaleTimeString('en-GB', {
      hour12: false
    })
  } else {
    console.error('Invalid time selected:', selectedTime)
    form.value.service_time = null
  }
}

// Submit form logic
const submitForm = async () => {
  if (!user.value) {
    alert('You must be logged in to create a service request.')
    return
  }

  if (!form.value.service_time || form.value.service_time === 'Invalid Date') {
    alert('Please select a valid time.')
    return
  }

  const newService = {
    ...form.value,
    user_id: user.value.id,
    service_date: date.value
  }

  try {
    if (!isEditMode.value) {
      // Creating a new service
      newService.status_id = 'Draft' // Set status to Draft for new services
    } else {
      // Editing an existing service
      newService.status_id = 'New' // Set status to New for edited services
    }

    const response = await serviceStore.submitService(newService)

    if (response.error) {
      alert('Error creating service: ' + response.error.message)
    } else {
      alert(
        'Service request ' +
          (isEditMode.value ? 'updated' : 'created') +
          ' successfully!'
      )
      emit('serviceCreated', response.data.id) // Emit event with new service ID
      serviceStore.resetService() // Reset the store for new entries
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    alert('An unexpected error occurred. Please try again later.')
  }
}
</script>

