<template>
  <div class="crud-page">
    <h2>Service CRUD Operations</h2>

    <!-- Form for Adding or Editing a Service -->
    <form @submit.prevent="isEditing ? handleUpdateService() : handleInsertService()">
      <div class="form-group">
        <label for="service-type">Service Type</label>
        <USelect
          v-model="serviceData.service_type_id"
          :options="serviceTypes.map(type => ({ value: type.id, label: type.type_name }))"
          required
        />
      </div>

      <div class="form-group">
        <label for="service-status">Service Status</label>
        <USelect
          v-model="serviceData.status_id"
          :options="serviceStatuses.map(status => ({ value: status.id, label: status.status }))"
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
        <input
          v-model="serviceData.service_date"
          type="date"
        >
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <!-- <textarea v-model="serviceData.description" placeholder="Service description"></textarea> -->
        <UTextarea
          v-model="serviceData.description"
          color="gray"
          variant="outline"
        />
      </div>
      <button type="submit">
        {{ isEditing ? 'Update' : 'Add' }} Service
      </button>
      <button
        v-if="isEditing"
        type="button"
        @click="cancelEdit"
      >
        Cancel
      </button>
    </form>

    <hr>

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
        <tr
          v-for="srv in services"
          :key="srv?.id"
        >
          <td>{{ srv?.servicetype?.type_name }}</td>
          <td>{{ srv?.servicestatuses?.status }}</td>
          <td>{{ srv?.customers?.full_name }}</td>
          <td>{{ srv?.service_date }}</td>
          <td>{{ srv?.description }}</td>
          <td>
            <button @click="editService(srv)">
              Edit
            </button>
            <button @click="onEditButtonClick(srv.id)">
              EditLog
            </button>
            <button @click="handleDeleteService(srv?.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Database } from '@/types/supabase'

const supabase = useSupabaseClient<Database>()
const {
  services,
  fetchAllServices,
  fetchServiceById,
  insertService,
  updateService,
  deleteService
} = useTestServiceCrud()

const serviceData = ref({
  service_type_id: '',
  status_id: '',
  customer_id: '',
  service_date: '',
  description: ''
})

const serviceTypes = ref([])
const serviceStatuses = ref([])
const customers = ref([])
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// Fetch all data related to services
onMounted(async () => {
  await fetchAllServices()
  await fetchRelatedData()
  await fetchServiceById()
})

// Fetch related table data for select options
async function fetchRelatedData() {
  const { data: types } = await supabase.from('servicetype').select('id, type_name')
  serviceTypes.value = types || []

  const { data: statuses } = await supabase.from('servicestatuses').select('id, status')
  serviceStatuses.value = statuses || []

  const { data: customerList } = await supabase.from('customers').select('id, full_name')
  customers.value = customerList || []
}

// Insert new service record
// Insert new service record
async function handleInsertService() {
  await insertService(serviceData.value) // Call the original insertService from composable
  resetForm()
  await fetchAllServices()
}

// Update existing service record
// Update existing service record
async function handleUpdateService() {
  if (editingId.value) {
    await updateService(editingId.value, serviceData.value) // Original updateService from composable
    resetForm()
    await fetchAllServices()
  }
}

// Delete service record
async function handleDeleteService(id: string) {
  await deleteService(id)
  await fetchAllServices()
}

// Edit service handler
async function editService(srv: any) {
  isEditing.value = true
  editingId.value = srv.id
  await fetchServiceById(srv.id) // Fetch service data
  serviceData.value = { ...srv } // Populate form with the service data
}

// Cancel edit mode
function cancelEdit() {
  resetForm()
}

// Reset form fields and cancel edit mode
function resetForm() {
  serviceData.value = {
    service_type_id: '',
    status_id: '',
    customer_id: '',
    service_date: '',
    description: ''
  }
  isEditing.value = false
  editingId.value = null
}

// Assume you have a function that gets called when the edit button is clicked
function onEditButtonClick(serviceId) {
  // Fetch the service details to edit
  fetchServiceById(serviceId)
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
