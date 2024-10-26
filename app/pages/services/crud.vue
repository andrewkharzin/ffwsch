<template>
  <div class="crud-page">
    <h2>Service CRUD Operations</h2>

    <!-- Form for Adding or Editing a Service -->
    <form @submit.prevent="isEditing ? handleUpdateService() : handleInsertService()">
      <div class="form-group">
        <label for="service-type">Service Type</label>
        <select v-model="serviceData.service_type_id" required>
          <option v-for="type in serviceTypes" :key="type.id" :value="type.id">
            {{ type.type_name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="service-status">Service Status</label>
        <select v-model="serviceData.status_id" required>
          <option v-for="status in serviceStatuses" :key="status.id" :value="status.id">
            {{ status.status }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="customer">Customer</label>
        <select v-model="serviceData.customer_id" required>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.full_name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="service-date">Service Date</label>
        <input type="date" v-model="serviceData.service_date" />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea v-model="serviceData.description" placeholder="Service description"></textarea>
      </div>

      <button type="submit">{{ isEditing ? 'Update' : 'Add' }} Service</button>
      <button type="button" v-if="isEditing" @click="cancelEdit">Cancel</button>
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
        <tr v-for="srv in services" :key="srv.id">
          <td>{{ srv.servicetype?.type_name }}</td>
          <td>{{ srv.servicestatuses?.status }}</td>
          <td>{{ srv.customers?.full_name }}</td>
          <td>{{ srv.service_date }}</td>
          <td>{{ srv.description }}</td>
          <td>
            <button @click="editService(srv)">Edit</button>
            <button @click="handleDeleteService(srv.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Database } from '@/types/supabase';

const supabase = useSupabaseClient<Database>();
const {
  services,
  fetchAllServices,
  insertService,
  updateService,
  deleteService,
} = useTestServiceCrud();

const serviceData = ref({
  service_type_id: '',
  status_id: '',
  customer_id: '',
  service_date: '',
  description: '',
});

const serviceTypes = ref([]);
const serviceStatuses = ref([]);
const customers = ref([]);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

// Fetch all data related to services
onMounted(async () => {
  await fetchAllServices();
  await fetchRelatedData();
});

// Fetch related table data for select options
async function fetchRelatedData() {
  const { data: types } = await supabase.from('servicetype').select('id, type_name');
  serviceTypes.value = types || [];

  const { data: statuses } = await supabase.from('servicestatuses').select('id, status');
  serviceStatuses.value = statuses || [];

  const { data: customerList } = await supabase.from('customers').select('id, full_name');
  customers.value = customerList || [];
}

// Insert new service record
// Insert new service record
async function handleInsertService() {
  await insertService(serviceData.value); // Call the original insertService from composable
  resetForm();
  await fetchAllServices();
}


// Update existing service record
// Update existing service record
async function handleUpdateService() {
  if (editingId.value) {
    await updateService(editingId.value, serviceData.value); // Original updateService from composable
    resetForm();
    await fetchAllServices();
  }
}

// Delete service record
async function handleDeleteService(id: string) {
  await deleteService(id);
  await fetchAllServices();
}

// Edit service handler
function editService(srv: any) {
  isEditing.value = true;
  editingId.value = srv.id;
  serviceData.value = { ...srv };
}

// Cancel edit mode
function cancelEdit() {
  resetForm();
}

// Reset form fields and cancel edit mode
function resetForm() {
  serviceData.value = {
    service_type_id: '',
    status_id: '',
    customer_id: '',
    service_date: '',
    description: '',
  };
  isEditing.value = false;
  editingId.value = null;
}
</script>

<style scoped>
.crud-page {
  padding: 1em;
}

.form-group {
  margin-bottom: 1em;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table, th, td {
  border: 1px solid #ddd;
}

th, td {
  padding: 0.5em;
  text-align: left;
}

button {
  margin-right: 0.5em;
}
</style>
