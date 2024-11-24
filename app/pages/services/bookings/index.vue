<script setup lang="ts">
import { ref } from 'vue'

const items = [
  {
    slot: 'new', // This will be used to link the tab to the slot
    label: 'New'
  },
  {
    slot: 'aviability',
    label: 'Aviability',
    disabled: true
  },
  {
    slot: 'tab3',
    label: 'Tab3'
  }
]

const bookingForm = ref({
  name: '',
  email: '',
  // Add your other form fields as necessary
})

function onSubmitBooking() {
  console.log('Booking form submitted', bookingForm)
}
</script>

<template>
  <UTabs :items="items" class="w-full">
    <!-- New Tab -->
    <template #new="{ item }">
      <UCard @submit.prevent="onSubmitBooking">
        <template #header>
          <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a new booking here. Fill in the details and click Save.
          </p>
        </template>

        <!-- Booking Form -->
        <AppBookingsFormsBookingForm v-model="bookingForm" />

        <template #footer>
          <UButton type="submit" color="black">
            Save Booking
          </UButton>
        </template>
      </UCard>
    </template>

    <!-- Aviability Tab (Disabled) -->
    <template #aviability="{ item }">
      <UCard>
        <template #header>
          <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
        </template>
        <p>This tab is currently unavailable.</p>
      </UCard>
    </template>

    <!-- Tab 3 -->
    <template #tab3="{ item }">
      <UCard>
        <template #header>
          <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
        </template>
        <p>Content for Tab3 goes here.</p>
      </UCard>
    </template>
  </UTabs>
</template>
