<template>
  <form @submit.prevent="submitForm">
    <div class="grid grid-cols-2 xs:grid-cols-1 gap-4">
      <div class="flex flex-col space-y-4">
        <div class="flex-auto w-38">
          <UFormGroup label="Date" required>
            <UInput
              type="datetime-local"
              v-model="form.service_date"
              required
            />
          </UFormGroup>
        </div>
        <UFormGroup label="Service Type" required>
          <USelect
            color="primary"
            variant="outline"
            :options="formattedServiceTypes"
            v-model="form.service_type_id"
            placeholder="Select Service Type"
            required
          />
        </UFormGroup>
        <!-- USelect for Status -->
        <UFormGroup label="Status" required>
          <USelect
            color="primary"
            variant="outline"
            :options="formattedStatuses"
            v-model="form.status_id"
            placeholder="Select Status"
            required
          />
        </UFormGroup>
        <div class="flex-auto w-38">
          <UButton type="submit" color="primary" variant="soft">Submit</UButton>
        </div>
      </div>

      <UFormGroup label="Description">
        <UTextarea v-model="form.description" color="gray" variant="outline" />
      </UFormGroup>
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(["serviceCreated"]);

const form = ref({
  service_type_id: "",
  service_date: "",
  description: "",
  status_id: "",
});

const {
  createService,
  serviceTypes,
  statuses,
  fetchServiceTypes,
  fetchStatuses,
} = useNewService();
const { user } = useSupabaseUser();

// Load service types and statuses
onMounted(() => {
  fetchServiceTypes();
  fetchStatuses();
});

// Format the service types for USelect component
const formattedServiceTypes = computed(() => {
  return serviceTypes.value.map((type) => ({
    label: type.type_name,
    value: type.id,
  }));
});

// Format the statuses for USelect component
const formattedStatuses = computed(() => {
  return statuses.value.map((status) => ({
    label: status.status,
    value: status.id,
  }));
});

const submitForm = async () => {
  const newService = {
    ...form.value,
    user_id: user.value.id, // Current user ID from Supabase user
  };

  const response = await createService(newService);
  if (response.error) {
    console.error(response.error.message);
  } else {
    alert("Service request created successfully!");
    // Emit event to notify the parent component
    emit("serviceCreated", response.data[0].id);
  }
};
</script>


<style scoped>
</style>
