<template>
  <div class="space-y-4">
    <!-- Book Type Selection -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Book Type</label>
      <USelect
        v-model="booking.book_type"
        :items="bookTypes"
        placeholder="Select book type"
        class="mt-2"
      />
    </div>

    <!-- Shipper Selection -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Shipper</label>
      <USelect
        v-model="booking.shipper_id"
        :items="shippers"
        placeholder="Select shipper"
        class="mt-2"
      />
    </div>

    <!-- Consignee Selection -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Consignee</label>
      <USelect
        v-model="booking.consignee_id"
        :items="consignees"
        placeholder="Select consignee"
        class="mt-2"
      />
    </div>

    <!-- Flight Input -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Flight</label>
      <UInput
        v-model="booking.flight"
        placeholder="Enter flight details"
        class="mt-2"
      />
    </div>

    <!-- Status Selection -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Status</label>
      <USelect
        v-model="booking.status"
        :items="statuses"
        placeholder="Select status"
        class="mt-2"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// Props
defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  shippers: {
    type: Array,
    required: true
  },
  consignees: {
    type: Array,
    required: true
  },
  statuses: {
    type: Array,
    required: true
  },
  bookTypes: {
    type: Array,
    required: true
  }
})

// Emit the updated model
defineEmits(['update:modelValue'])

// Sync modelValue with local state
const booking = $ref({ ...modelValue })

watch(
  () => booking,
  (newBooking) => {
    emit('update:modelValue', newBooking)
  },
  { deep: true }
)
</script>
