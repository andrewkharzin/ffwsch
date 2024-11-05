<template>
  <form @submit.prevent="onSubmit">
    <div class="form-group">
      <label for="service-type">Service Type</label>
      <USelect
        v-model="serviceData.service_type_id"
        :options="serviceTypes.map(type => ({ label: type.type_name, value: type.id }))"
        placeholder="Select Service Type"
        required
      />
    </div>

    <div class="form-group">
      <label for="service-status">Service Status</label>
      <USelect
        v-model="serviceData.status_id"
        :options="serviceStatuses.map(status => ({ label: status.status, value: status.id }))"
        placeholder="Select Service Status"
        required
      />
    </div>

    <div class="form-group">
      <label for="customer">Customer</label>
      <USelect
        v-model="serviceData.customer_id"
        :options="customers.map(customer => ({ label: customer.full_name, value: customer.id }))"
        placeholder="Select Customer"
        required
      />
    </div>

    <UButton
      type="submit"
      color="primary"
    >
      {{ isEditing ? 'Update' : 'Add' }}
    </UButton>
    <UButton
      color="secondary"
      @click="handleSendService"
    >
      Send
    </UButton>
    <UButton
      color="error"
      @click="handleCancelService"
    >
      Cancel
    </UButton>
  </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  serviceData: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  serviceTypes: {
    type: Array,
    default: () => []
  },
  serviceStatuses: {
    type: Array,
    default: () => []
  },
  customers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'sendService', 'cancelService'])

const onSubmit = () => {
  emit('submit')
}

const handleSendService = () => {
  emit('sendService')
}

const handleCancelService = () => {
  emit('cancelService')
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}
</style>
