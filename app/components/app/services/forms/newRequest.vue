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
            <UFormGroup label="Time">
              <!-- <UiTimePicker
                v-model="form.service_time"
                @change="handleTimeChange"
              /> -->
              <UInput v-model="form.service_time" />
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

const { customer, error, loading, fetchCustomerByUserId } =
  useCustomerByUserId()
const emit = defineEmits(['serviceCreated'])
const date = ref(new Date())
const serviceStore = useServiceStore() // Using Pinia store

const form = ref({
  service_type_id: '',
  service_date: new Date().toISOString().split('T')[0],
  service_time: '',
  description: '',
  status_id: 'a2b67304-0593-4eb7-96b8-97e05a198597', // Default status for new entries
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

// Submit form logic
const submitForm = async () => {
  if (!user.value) {
    alert('You must be logged in to create a service request.')
    return
  }

  const customerData = await fetchCustomerByUserId()

  if (!customerData || !customerData.id) {
    alert('Customer not found. Please ensure your account is set up correctly.')
    return
  }

  const newService = {
    ...form.value,
    user_id: user.value.id,
    customer_id: customerData.id,
    service_date: new Date(date.value).toISOString().split('T')[0] // Convert date to 'YYYY-MM-DD'
  }

  // Validate UUID fields
  if (
    !newService.customer_id ||
    !newService.service_type_id ||
    !newService.user_id
  ) {
    console.error('Invalid UUIDs:', {
      customer_id: newService.customer_id,
      service_type_id: newService.service_type_id,
      user_id: newService.user_id
    })
    return // Exit if there are invalid UUIDs
  }

  // Assign the status_id based on edit mode
  if (!isEditMode.value) {
    newService.status_id = serviceStore.statusIds.draft // Ensure this is a valid UUID
  } else {
    newService.status_id = serviceStore.statusIds.new // Ensure this is a valid UUID
  }

  // Log the newService object before submission
  console.log('newService object', newService)

  try {
    const response = await serviceStore.submitService(newService)

    if (response.error) {
      alert('Error creating service: ' + response.error.message)
    } else {
      alert(
        'Service request ' +
          (isEditMode.value ? 'updated' : 'created') +
          ' successfully!'
      )
      emit('serviceCreated', response.id) // Emit event with new service ID
      serviceStore.resetService() // Reset the store for new entries
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    alert('An unexpected error occurred. Please try again later.')
  }
}
</script>
