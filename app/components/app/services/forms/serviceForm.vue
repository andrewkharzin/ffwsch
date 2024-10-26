<template>
  <form @submit.prevent="onSubmit">
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
export default {
  props: {
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
  },
  emits: ['submit', 'sendService', 'cancelService'],
  methods: {
    onSubmit() {
      this.$emit('submit')
    },
    handleSendService() {
      this.$emit('sendService')
    },
    handleCancelService() {
      this.$emit('cancelService')
    }
  }
}
</script>

<style scoped>
/* Add any specific styling here */
</style>
