<template>
  <div>
    new
    <AppServicesFormsServiceForm
      :serviceData="serviceData"
      :isEditing="isEditing"
      :serviceTypes="serviceTypes"
      :serviceStatuses="serviceStatuses"
      :customers="customers"
      @submit="handleInsertOrUpdate"
      @sendService="handleSendService"
      @cancelService="handleCancelService"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useServiceStore } from '../../store/serviceStore'

const serviceStore = useServiceStore()
// Reactive references for form data and editing state
const serviceData = ref({
  service_type_id: '',
  customer_id: '',
  status_id: '', // This will be auto-set to Draft
})
const isEditing = ref(false)

// Function to handle inserting or updating a service
const handleInsertOrUpdate = async () => {
  if (isEditing.value) {
    await serviceStore.updateService(serviceData.value)
  } else {
    await serviceStore.addService(serviceData.value)
  }
}

// Function to handle sending a service
const handleSendService = async () => {
  await serviceStore.changeStatus(serviceData.value.id, 'Sent')
}

// Function to handle canceling a service
const handleCancelService = async () => {
  await serviceStore.changeStatus(serviceData.value.id, 'Canceled')
}

// Data arrays for form options
const serviceTypes = ref([]) // Populate this based on your data
const serviceStatuses = ref([]) // Populate this based on your data
const customers = ref([]) // Populate this based on your data
</script>
