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

        <UFormGroup label="Status">
          <!-- <USelect
            v-model="form.status_id"
            color="primary"
            variant="outline"
            :options="formattedStatuses"
            placeholder="Select Status"
            required
          /> -->
        </UFormGroup>

        <div class="w-full">
          <UButton
            type="submit"
            color="primary"
            variant="soft"
            class="w-full sm:w-auto"
          >
            Submit
          </UButton>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'

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

const form = ref({
  service_type_id: '',
  service_date: new Date().toISOString().split('T')[0], // Set default date
  service_time: '',
  description: '',
  status_id: '',
  user_id: ''
})

const { createService } = useNewService()
const user = useSupabaseUser()

// Format the service types for USelect component
const formattedServiceTypes = computed(() => {
  return props.serviceTypes
})

// Format the statuses for USelect component
const formattedStatuses = computed(() => {
  return props.statuses
})

const handleTimeChange = (selectedTime) => {
  if (selectedTime instanceof Date && !isNaN(selectedTime.getTime())) {
    // Format the selected time to 'HH:mm:ss'
    form.value.service_time = selectedTime.toLocaleTimeString('en-GB', {
      hour12: false
    })
  } else {
    console.error('Invalid time selected:', selectedTime)
    form.value.service_time = null
  }
}

const submitForm = async () => {
  console.log('Submitting form...')

  if (!user.value) {
    console.error('User not logged in.')
    alert('You must be logged in to create a service request.')
    return
  }

  // Check if the time is valid before submission
  if (!form.value.service_time || form.value.service_time === 'Invalid Date') {
    alert('Please select a valid time.')
    return
  }

  const newService = {
    ...form.value,
    user_id: user.value.id,
    service_date: date.value // Ensure this is correctly se
  }
  console.log('User ID', newService)

  try {
    const response = await createService(newService)

    if (response && response.error) {
      console.error('Error from createService:', response.error.message)
      alert('Error creating service: ' + response.error.message)
    } else {
      alert('Service request created successfully!')
      emit('serviceCreated', response.data[0].id)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    alert('An unexpected error occurred. Please try again later.')
  }
}
</script>

<style scoped>
</style>
