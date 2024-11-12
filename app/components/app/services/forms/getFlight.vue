<!-- components/getFlight.vue -->
<template>
  <div>
    <UFormGroup>
      <label for="flightInput">Search for a Flight</label>
      <input
        id="flightInput"
        v-model="flightNumber"
        @input="searchFlight"
        placeholder="Enter flight number, e.g., SU1212"
        type="text"
      />
    </UFormGroup>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <ul v-if="flights.length > 0">
      <li v-for="flight in flights" :key="flight.id">
        {{ flight.flight_number }} - {{ flight.flight_route }}
      </li>
    </ul>

    <div v-else-if="flightNumber && !loading">No such flight found.</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useServiceCustomerFlights } from '@/composables/useServiceCustomerFlights';

const flightNumber = ref('');
const { flights, loading, error, fetchFlights } = useServiceCustomerFlights();

const searchFlight = () => {
  if (flightNumber.value) {
    fetchFlights(flightNumber.value);
  } else {
    flights.value = [];
  }
};
</script>

<style scoped>
/* Add any desired styling here */
</style>
