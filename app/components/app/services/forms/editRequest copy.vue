<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col space-y-4">

        <!-- Date Field -->
        <UFormGroup label="Date" required>
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
          <span v-if="selectedServiceType" class="block text-sm text-gray-500">
            Selected Service Type: {{ selectedServiceType.label }}
          </span>
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
        </div>

        <!-- Time Field -->
         <!-- Separate Fields for Hours and Minutes -->
         <UFormGroup label="Time (HH:MM)">
          <div class="flex space-x-2">
            <!-- Hours Input -->
            <UInput
              v-model="hours"
              type="number"
              min="0"
              max="23"
              placeholder="HH"
              class="w-16 text-center"
            />
            <span class="text-gray-500">:</span>
            <!-- Minutes Input -->
            <UInput
              v-model="minutes"
              type="number"
              min="0"
              max="59"
              placeholder="MM"
              class="w-16 text-center"
              required
            />
          </div>
          <span v-if="!isValidTimeFormat" class="text-red-500 text-xs">
            Please enter a valid time in HH:MM format.
          </span>
        </UFormGroup>

        <!-- Description Field -->
        <UFormGroup label="Description" required>
          <UTextarea v-model="form.description" color="gray" variant="outline" />
        </UFormGroup>

        <!-- Status Field (Read-only) -->
        <UFormGroup label="Status">
          <UInput v-model="form.status_id" color="primary" variant="outline" disabled />
        </UFormGroup>

        <!-- Submit Button -->
        <!-- Submit and Send Buttons -->
        <div class="flex space-x-4">
          <UButton type="submit" color="primary" variant="soft" class="w-full sm:w-auto">Update</UButton>
          <UButton color="info" variant="soft" @click="sendService" :loading="isSending" class="w-full sm:w-auto">Send</UButton>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useServiceStore } from '../../../../stores/serviceStore' // Ensure correct path

const serviceStore = useServiceStore()
const route = useRoute()
// Initialize toast
const toast = useToast();

const hours = ref('')
const minutes = ref('')
const isSending = ref(false);


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

const form = ref({
  service_type_id: '',
  service_date: '',
  service_time: '',
  description: '',
  status_id: '',
  user_id: ''
})

// Set hours and minutes when form data is loaded
onMounted(async () => {
  const serviceId = route.params.id
  const serviceData = await serviceStore.fetchServiceById(serviceId)
  if (serviceData) {
    form.value = { ...serviceData }
    if (serviceData.service_time) {
      const [loadedHours, loadedMinutes] = serviceData.service_time.split(':')
      hours.value = loadedHours
      minutes.value = loadedMinutes
    }
  }
})

// Format the service types for USelect component
const formattedServiceTypes = computed(() => props.serviceTypes)
// Submit form logic
const submitForm = async () => {
  try {
    await serviceStore.updateService(form.value)
    // Handle successful update, e.g., show a success toast or redirect
  } catch (error) {
    console.error('Error updating service:', error)
    // Handle error, e.g., show an error toast
  }
}

const sendService = async () => {
  try {
    isSending.value = true;

    // Format hours and minutes for the service_time field
    const validHours = hours.value.padStart(2, '0'); // Ensure two-digit hours
    const validMinutes = minutes.value.padStart(2, '0'); // Ensure two-digit minutes
    form.value.service_time = `${validHours}:${validMinutes}`; // Combine into "HH:MM" format

    form.value.status_id = serviceStore.statusIds.new; // Update status to New

    // Update service with new status and formatted time
    await serviceStore.updateService(form.value);

    // Show success toast notification
    toast.add('Data was sent to managers, waiting for response', {
      duration: 5000, // Toast duration in milliseconds
      position: 'top-center', // Position of the toast
      color: 'info'
    });
  } catch (error) {
    console.error('Error sending service:', error);
    toast.error('Failed to send data. Please try again.');
  } finally {
    isSending.value = false;
  }
};
</script>
