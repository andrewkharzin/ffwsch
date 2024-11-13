<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const isOpen = ref(false) // Controls modal visibility
// Define the `select-flight` event
const emit = defineEmits(['select-flight'])
const isModalOpen = ref(true) // To control the modal visibility
const flightNumber = ref('') // The main input for flight selection
const { flights, loading, error, fetchFlights } = useServiceCustomerFlights() // Fetch flights from composable

// Fetch flights based on input
const searchFlight = async () => {
  if (flightNumber.value) {
    await fetchFlights(flightNumber.value) // Call fetchFlights function to populate flights array
  } else {
    flights.value = [] // Clear flights if the input is empty
  }
}

// Set selected flight and close modal
// Function to handle flight selection
function selectFlight(row) {
  flightNumber.value = row.flight_number // Set the selected flight number
  emit('select-flight', row.id) // Emit the flight ID
  isModalOpen.value = false // Close the modal
}

const columns = [
  { key: 'flight_number', label: 'Flight Number', sortable: true },
  { key: 'flight_pst', label: 'Departure Time', sortable: true }
]

// Selected Rows
const selectedRows = ref([])
// Function to handle row selection
function select(row) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selectedRows.value.push(row)
  } else {
    selectedRows.value.splice(index, 1)
  }
}
</script>

<template>
  <div>
    <!-- Main input for searching flights -->
    <UFormGroup>
      <label
        for="flightInput"
        class="text-sm font-light tracking-wider"
      >Search flight</label>
      <UInput
        id="flightInput"
        v-model="flightNumber"
        placeholder="Enter flight number, e.g., SU1212"
        type="text"
        class="mt-2"
        @input="searchFlight"
      />
    </UFormGroup>

    <!-- Button to open modal when flights are available -->
    <UButton
      v-if="flights.length > 0"
      class="mt-2"
      icon="i-carbon:flight-roster"
      variant="soft"
      color="primary"
      label="Flight"
      @click="isOpen = true"
    />

    <!-- Flight Selection Modal -->
    <UModal v-model="isOpen">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">
          Flight
        </h2>

        <!-- Loading or error messages -->
        <div v-if="loading">
          Loading...
        </div>
        <div v-else-if="error">
          {{ error }}
        </div>
        <div v-else-if="flights.length === 0 && flightNumber">
          No such flight found.
        </div>

        <!-- Flight table for selection -->
        <UTable
          :rows="flights"
          :columns="columns"
          :ui="{ default: { checkbox: { color: 'gray' } } }"
          @select="selectFlight"
        >
          <!-- Select Checkbox Column -->
          <template #select-data="{ row }">
            <UCheckbox
              v-model="selectedRows"
              :value="row"
            />
          </template>

          <!-- Flight Number Column -->
          <template #flight_number-data="{ row }">
            <div class="cursor-pointer hover:bg-gray-100">
              {{ row.flight_number ?? 'N/A' }}
            </div>
          </template>

          <!-- Departure Time Column -->
          <template #flight_pst-data="{ row }">
            <div class="cursor-pointer hover:bg-gray-100">
              {{ row.flight_pst ?? 'N/A' }}
            </div>
          </template>
        </UTable>
      </div>
    </UModal>
  </div>
</template>

<style scoped>
/* Style for highlighting row on hover */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}
</style>
