<template>
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

    <button type="submit">{{ isEditing ? 'Update' : 'Add' }}</button>
    <button type="button" @click="handleSendService">Send</button>
    <button type="button" @click="handleCancelService">Cancel</button>
  </form>
</template>

<script>
import { ref, computed } from 'vue'
import { useServiceStore } from '/stores/serviceStore/'

export default {

  setup() {
    const serviceStore = useServiceStore()
    const serviceData = ref({
      service_type_id: '',
      customer_id: '',
      status_id: '', // This will be auto-set to Draft
    })
    const isEditing = ref(false)

    const handleInsertService = async () => {
      await serviceStore.addService(serviceData.value)
      // Reset the form or navigate away
    }

    const handleUpdateService = async () => {
      await serviceStore.updateService(serviceData.value)
      // Reset the form or navigate away
    }

    const handleSendService = async () => {
      await serviceStore.changeStatus(serviceData.value.id, 'Sent')
      // Optionally reset the form or navigate
    }

    const handleCancelService = async () => {
      await serviceStore.changeStatus(serviceData.value.id, 'Canceled')
      // Optionally reset the form or navigate
    }

    return {
      serviceData,
      isEditing,
      handleInsertService,
      handleUpdateService,
      handleSendService,
      handleCancelService,
      serviceTypes: [], // Populate this based on your data
      serviceStatuses: [], // Populate this based on your data
      customers: [], // Populate this based on your data
    }
  },
}
</script>
