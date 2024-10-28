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
                    @dayclick="handleDayClick"
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
            @change="(value) => console.log('Selected Service Type ID:', value)"
          />
        </UFormGroup>

        <UFormGroup label="Status">
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
    alert('You must be logged in to create a service request.');
    return;
  }

  const customerData = await fetchCustomerByUserId();

  if (!customerData || !customerData.id) {
    alert('Customer not found. Please ensure your account is set up correctly.');
    return;
  }

  // Ensure all required fields are valid
  if (!form.value.service_type_id || !customerData.id || !user.value.id) {
    console.error("Missing required fields. Please check your form.");
    return;
  }

  const newService = {
    service_type_id: form.value.service_type_id,
    user_id: user.value.id,
    customer_id: customerData.id,
    service_date: new Date(date.value).toISOString().split('T')[0],
    service_time: form.value.service_time,
    description: form.value.description,
    status_id: isEditMode.value ? serviceStore.statusIds.new : serviceStore.statusIds.draft,
  };

  console.log("New Service before submission:", newService);

  try {
    const response = await serviceStore.insertService(newService);
    if (response) {
      emit('serviceCreated', response.id);
      serviceStore.resetService();
      alert('Service request created successfully!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
};

</script>