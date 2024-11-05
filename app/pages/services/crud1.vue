<template>
  <div class="crud-page">
    <h2>Service CRUD Operations</h2>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <form
      v-if="serviceTypes.length && serviceStatuses.length && customers.length"
      @submit.prevent="isEditing ? handleUpdateService() : handleInsertService()"
    >
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

    <h3>Services List</h3>
    <div class="table-container">
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
            :key="srv.id"
          >
            <td>{{ getServiceTypeName(srv.service_type_id) }}</td>
            <td>{{ getServiceStatusName(srv.status_id) }}</td>
            <td>{{ getCustomerName(srv.customer_id) }}</td>
            <td>{{ srv.service_date }}</td>
            <td>{{ srv.description }}</td>
            <td>
              <button @click="editService(srv)">
                Edit
              </button>
              <button @click="handleDeleteService(srv.id)">
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="6">
              No services available.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { useServiceStore } from '../../store/useServiceStore'

const serviceStore = useServiceStore()
const error = ref(null)

const {
  serviceData,
  services,
  serviceTypes,
  serviceStatuses,
  customers,
  isEditing,
  loadAllData,
  handleInsertService,
  handleUpdateService,
  handleDeleteService,
  editService,
  cancelEdit
} = serviceStore

onMounted(async () => {
  try {
    await loadAllData()
    console.log('Data loaded:', {
      services: services.value,
      serviceTypes: serviceTypes.value,
      serviceStatuses: serviceStatuses.value,
      customers: customers.value
    })
  } catch (e) {
    error.value = e.message || 'Error loading data'
    console.error('Error loading data:', e)
  }
})

// Watch for unexpected changes in the store data
watchEffect(() => {
  console.log('Current services:', services.value)
  console.log('Current serviceTypes:', serviceTypes.value)
  console.log('Current serviceStatuses:', serviceStatuses.value)
  console.log('Current customers:', customers.value)
})

// Utility functions to get names from IDs
function getServiceTypeName(serviceTypeId) {
  const type = serviceTypes.value.find(type => type.id === serviceTypeId)
  if (type) {
    console.log(`Found service type for ID ${serviceTypeId}: ${type.type_name}`)
    return type.type_name
  }
  console.warn(`Service type ID ${serviceTypeId} not found.`)
  return 'Unknown'
}

function getServiceStatusName(statusId) {
  const status = serviceStatuses.value.find(status => status.id === statusId)
  if (status) {
    console.log(`Found service status for ID ${statusId}: ${status.status}`)
    return status.status
  }
  console.warn(`Service status ID ${statusId} not found.`)
  return 'Unknown'
}

function getCustomerName(customerId) {
  const customer = customers.value.find(customer => customer.id === customerId)
  if (customer) {
    console.log(`Found customer for ID ${customerId}: ${customer.full_name}`)
    return customer.full_name
  }
  console.warn(`Customer ID ${customerId} not found.`)
  return 'Unknown'
}

function onEditButtonClick(serviceId) {
  editService(serviceId)
}
</script>

<style scoped>
.crud-page {
  padding: 1em;
}

.form-group {
  margin-bottom: 1em;
}

/* Add scrolling to the table */
.table-container {
  max-height: 400px; /* Adjust height as needed */
  overflow-y: auto;
  margin-top: 1em;
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

.error {
  color: red;
}
</style>
