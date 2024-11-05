<template>
  <div>
    <h1 class="text-xl font-bold mb-4">
      Add Service
    </h1>
    <form @submit.prevent="handleSubmit">
      <UFormGroup label="Service Type ID">
        <UInput
          v-model="serviceTypeId"
          placeholder="Service Type ID"
          icon="i-heroicons-id"
        />
      </UFormGroup>

      <UFormGroup label="Service Date">
        <UInput
          v-model="serviceDate"
          type="datetime-local"
          placeholder="Service Date"
          icon="i-heroicons-calendar"
        />
      </UFormGroup>

      <UFormGroup label="Description">
        <UInput
          v-model="description"
          placeholder="Description"
          icon="i-heroicons-document-text"
        />
      </UFormGroup>

      <UFormGroup label="Status ID">
        <UInput
          v-model="statusId"
          placeholder="Status ID"
          icon="i-heroicons-check-circle"
        />
      </UFormGroup>

      <UFormGroup label="Customer ID">
        <UInput
          v-model="customerId"
          placeholder="Customer ID"
          icon="i-heroicons-user"
        />
      </UFormGroup>

      <UFormGroup label="Reason">
        <UInput
          v-model="reason"
          placeholder="Reason"
          icon="i-heroicons-exclamation-circle"
        />
      </UFormGroup>

      <UFormGroup label="User ID">
        <UInput
          v-model="userId"
          placeholder="User ID"
          icon="i-heroicons-user-circle"
        />
      </UFormGroup>

      <UFormGroup
        label="Order Now"
        class="flex items-center"
      >
        <input
          v-model="orderNow"
          type="checkbox"
          class="mr-2"
        >
        <span>Order Now</span>
      </UFormGroup>

      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Insert Service
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const serviceTypeId = ref('')
const serviceDate = ref('')
const serviceTime = ref('')
const description = ref('')
const statusId = ref('')
const customerId = ref('')
const reason = ref('')
const userId = ref('')
const orderNow = ref(false)
const { insertService } = useCrudService()

const handleSubmit = async () => {
  const serviceData = {
    service_type_id: serviceTypeId.value,
    service_date: new Date(serviceDate.value).toISOString(),
    description: description.value,
    status_id: statusId.value,
    customer_id: customerId.value,
    reason: reason.value,
    user_id: userId.value,
    order_now: orderNow.value
  }

  await insertService(serviceData)

  // Reset the form fields after successful submission
  serviceTypeId.value = ''
  serviceDate.value = ''
  serviceTime.value = ''
  description.value = ''
  statusId.value = ''
  customerId.value = ''
  reason.value = ''
  userId.value = ''
  orderNow.value = false
}
</script>

<style scoped>
/* You can add additional styles here */
</style>
