<template>
  <div class="crud-page">
    <h2>Service CRUD Operations</h2>

    <!-- Form for Adding or Editing a Service -->
    <form @submit.prevent="isEditing ? (isUpdating ? handleUpdateService() : cancelEdit()) : handleInsertService()">
      <div class="form-group">
        <label for="service-type">Service Type</label>
        <USelect
          v-model="serviceData.service_type_id"
          :options="serviceTypes.map(type => ({ value: type.id, label: type.type_name }))"
          required
        />
      </div>

      <div class="form-group">
        <label for="customer">Customer</label>
        <USelect
          v-model="serviceData.customer_id"
          :options="customers.map(customer => ({ value: customer.id, label: customer.full_name }))"
          required
        />
      </div>

      <div class="form-group">
        <label for="service-date">Service Date</label>
        <input type="date" v-model="serviceData.service_date" />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <UTextarea v-model="serviceData.description" color="gray" variant="outline" />
      </div>
      <div>
        <p class="text-xs font-light text-gray-500">
          Status:
          <span class="text-xs font-bold text-red-500">{{ getServiceStatus }}</span>
        </p>
      </div>
      <span>Status: {{ getServiceStatus }}</span>

      <div class="flex flex-row">
        <UButton type="submit">{{ isEditing ? (isUpdating ? 'Update' : 'Send') : 'Add' }} Service</UButton>
        <UButton type="button" v-if="isEditing && isUpdating" @click="cancelEdit">Cancel</UButton>

      </div>
    </form>

    <hr />

    <!-- Displaying List of Services -->
    <h3>Services List</h3>
    <table>
      <thead>
        <tr>
          <th>Service Type</th>
          <th>Service Status</th>
          <th>Customer</th>
          <th>Service Date</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="srv in services" :key="srv?.id">
          <td>{{ srv?.servicetype?.type_name }}</td>
          <td>{{ getServiceStatusById(srv?.status_id) }}</td>
          <td>{{ srv?.customers?.full_name }}</td>
          <td>{{ srv?.service_date }}</td>
          <td>{{ srv?.description }}</td>
          <td>
            <UButton @click="editService(srv)">Edit</UButton>
            <UButton
              v-if="srv.status_id === newStatusId"
              @click="handleDeleteService(srv?.id)">Delete</UButton>
            <UButton
              v-if="srv.status_id === canceledStatusId"
              @click="handleDeleteService(srv?.id)">Delete</UButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Database } from '@/types/supabase';

const supabase = useSupabaseClient<Database>();

const {
  services,
  fetchAllServices,
  fetchServiceById,
  insertService,
  updateService,
  deleteService,
} = useTestServiceCrud();

const serviceData = ref({
  service_type_id: '',
  status_id: 'Draft',
  customer_id: '',
  service_date: '',
  description: '',
});

const serviceTypes = ref([]);
const customers = ref([]);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const newStatusId = 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc';
const canceledStatusId = 'c92998e3-a1b8-43eb-9c8e-74f983db45a9';

onMounted(async () => {
  await fetchAllServices();
  await fetchRelatedData();
});

async function fetchRelatedData() {
  const { data: types } = await supabase.from('servicetype').select('id, type_name');
  serviceTypes.value = types || [];

  const { data: customerList } = await supabase.from('customers').select('id, full_name');
  customers.value = customerList || [];
}

async function handleInsertService() {
  const user = useSupabaseUser();

  if (user.value && user.value.app_metadata && user.value.app_metadata.role === 'customer') {
    serviceData.value.status_id = '138261c0-235e-4a19-9b1f-c4ef8afe8529'; // Assuming this is the correct status ID

    console.log('Service Data before insert:', serviceData.value);

    // Validate required fields
    if (!serviceData.value.service_type_id || !serviceData.value.customer_id || !serviceData.value.service_date || !serviceData.value.description) {
      alert('Please fill all required fields.');
      return;
    }

    const response = await insertService(serviceData.value);

    if (response) {
      const { error } = response; // Only destructure if response is not null
      if (error) {
        console.error('Insert Error:', error);
        alert('An error occurred while adding the service: ' + error.message);
        return;
      }
    } else {
      alert('An unexpected error occurred. Please try again later.');
      return;
    }

    resetForm(); // Reset the form after insertion
    await fetchAllServices(); // Fetch all services to update the list
  } else {
    alert('You do not have permission to create a service.'); // Alert user if not authorized
  }
}



async function handleUpdateService() {
  if (editingId.value) {
    serviceData.value.status_id = newStatusId;
    await updateService(editingId.value, serviceData.value);
    resetForm();
    await fetchAllServices();
  }
}

async function handleDeleteService(id: string) {
  await deleteService(id);
  await fetchAllServices();
}

async function editService(srv: any) {
  isEditing.value = true;
  editingId.value = srv.id;
  await fetchServiceById(srv.id);
  serviceData.value = { ...srv };
}

function cancelEdit() {
  if (editingId.value) {
    serviceData.value.status_id = canceledStatusId;
    updateService(editingId.value, serviceData.value);
  }
  resetForm();
}

function resetForm() {
  serviceData.value = {
    service_type_id: '',
    status_id: 'Draft',
    customer_id: '',
    service_date: '',
    description: '',
  };
  isEditing.value = false;
  editingId.value = null;
}

function getServiceStatusById(statusId) {
  const statusMapping = {
    '138261c0-235e-4a19-9b1f-c4ef8afe8529': 'Draft',
    'b3d9ebe7-f348-4fc2-924e-f61256bf13fc': 'New',
    'c92998e3-a1b8-43eb-9c8e-74f983db45a9': 'Canceled',
  };

  return statusMapping[statusId] || 'Pending';
}

const getServiceStatus = computed(() => {
  const currentService = services.value.find(srv => srv.id === editingId.value);
  return currentService ? getServiceStatusById(currentService.status_id) : 'Draft';
});
</script>

