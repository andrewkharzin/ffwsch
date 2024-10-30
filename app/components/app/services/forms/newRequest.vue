<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col space-y-4">

        <!-- Date Field -->
        <div class="flex-auto w-full">
          <UFormGroup label="Date" required>
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton
                icon="i-heroicons-calendar-days-20-solid"
                :label="date ? format(new Date(date), 'd MMM, yyyy') : format(new Date(), 'd MMM, yyyy')"
              />
              <template #panel="{ close }">
                <DatePicker
                  v-model="date"
                  :default-date="new Date()"
                  is-required
                  @close="close"
                  @dayclick="handleDayClick"
                />
              </template>
            </UPopover>
          </UFormGroup>
        </div>

        <!-- Service Type Field -->
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

        <!-- Conditionally Rendered Fields for Editing Mode -->
        <template v-if="isEditMode">
          <!-- Time Field -->
          <UFormGroup label="Time">
            <UInput v-model="form.service_time" />
          </UFormGroup>

          <!-- Description Field -->
          <UFormGroup label="Description">
            <UTextarea v-model="form.description" color="gray" variant="outline" />
          </UFormGroup>

          <!-- Status Field (Read-only) -->
          <UFormGroup label="Status">
            <UInput v-model="form.status_id" color="primary" variant="outline" disabled />
          </UFormGroup>
        </template>

        <!-- Submit Button with Dynamic Label -->
        <div class="w-full">
          <UButton type="submit" color="primary" variant="soft" class="w-full sm:w-auto">
            {{ isEditMode ? 'Send' : 'Submit' }}
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

const toast = useToast()
const router = useRouter()

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

const { customer, error, loading, fetchCustomerByUserId } = useCustomerByUserId()
const emit = defineEmits(['serviceCreated'])
const date = ref(new Date())
const serviceStore = useServiceStore() // Using Pinia store

const form = ref({
  service_type_id: '',
  service_date: new Date().toISOString().split('T')[0],
  service_time: '',
  description: '',
  status_id: '138261c0-235e-4a19-9b1f-c4ef8afe8529', // Default status for new entries
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

watch(
  () => props.serviceTypes,
  (newServiceTypes) => {
    formattedServiceTypes.value = newServiceTypes.map(type => ({
      label: type.type_name,
      value: type.id
    }));
  },
  { immediate: true } // Ensure it runs immediately on the initial render
);

watch(() => form.value.service_type_id, (newValue) => {
  console.log('Updated Service Type ID:', newValue);
});

// Submit form logic
const submitForm = async () => {
  if (!user.value) {
    console.log('User not logged in')
    toast.add({
      title: 'Error',
      description: 'You must be logged in to create a service request.',
      color: 'error'
    })
    return
  }

  const customerData = await fetchCustomerByUserId()
  console.log('Fetched Customer Data:', customerData)

  if (!customerData || !customerData.id) {
    console.log('Customer not found')
    toast.add({
      title: 'Error',
      description: 'Customer not found. Please ensure your account is set up correctly.',
      color: 'error'
    })
    return
  }

  const newService = {
    service_type_id: form.value.service_type_id,
    user_id: user.value.id,
    customer_id: customerData.id,
    service_date: new Date(date.value).toISOString().split('T')[0],
    status_id: isEditMode.value ? serviceStore.statusIds.new : serviceStore.statusIds.draft,
  }

  if (isEditMode.value) {
    newService.service_time = form.value.service_time
    newService.description = form.value.description
  }

  console.log("New Service data prepared:", newService)

  try {
    const response = await serviceStore.insertService(newService)
    console.log("Service insertion response:", response)

    if (response) {
      console.log('Service successfully created')
      emit('serviceCreated', response.id)
      serviceStore.resetService()

      toast.add({
        title: 'Success',
        description: 'Service request created successfully!',
        color: 'success',
        duration: 10000,
        actions: [
          {
            label: 'OK',
            onClick: (toastInstance) => toastInstance.dismiss()
          },
          {
            label: 'Add Details',
            onClick: () => router.push(`/services/customize/${response.id}`)
          }
        ]
      })
    } else {
      console.log("No response received from insertService")
    }
  } catch (error) {
    console.error('Unexpected error in insertService:', error)
    toast.add({
      title: 'Error',
      description: 'An unexpected error occurred. Please try again later.',
      color: 'error'
    })
  }
}


</script>
