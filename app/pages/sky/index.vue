<template>
  <div style="height: 100vh; width: 100vw">
    <!-- Leaflet Map Component -->
    <LMap
      ref="map"
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
    >
      <!-- Tile Layer for OpenStreetMap -->
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- Markers for Each Flight -->
      <LMarker
        v-for="(flight, index) in filteredFlights"
        :key="index"
        :lat-lng="[flight[6], flight[5]]"
      >
        <LPopup>
          <div>
            <p><strong>Call Sign:</strong> {{ flight[1] }}</p>
            <p><strong>Country:</strong> {{ flight[2] }}</p>
            <p><strong>Altitude:</strong> {{ flight[7].toFixed(0) }} m</p>
            <p><strong>Velocity:</strong> {{ flight[9] }} m/s ({{ convertToKmH(flight[9]) }} km/h)</p>
          </div>
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import L from 'leaflet'

const zoom = ref(6)
const center = ref([55.751244, 37.618423]) // Centered on Moscow

// Flight data state
const flights = ref([])

// Computed property to filter flights from Russian Federation
const filteredFlights = computed(() => {
  return flights.value.filter(flight => flight[2] === 'Russian Federation')
})

// // Define the plane icon
// const planeIcon = L.icon({
//   iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Plane_icon_emoji.svg/128px-Plane_icon_emoji.svg.png', // Use a URL for plane icon
//   iconSize: [32, 32], // Set the size of the icon
//   iconAnchor: [16, 16], // Anchor the icon to the center
//   popupAnchor: [0, -16] // Position of the popup relative to the icon
// })

// Convert m/s to km/h
const convertToKmH = (velocityInMs) => {
  return (velocityInMs * 3.6).toFixed(2) // Convert to km/h
}

// Fetch flight data from OpenSky API
onMounted(async () => {
  try {
    const response = await fetch('https://opensky-network.org/api/states/all')
    const data = await response.json()
    flights.value = data.states || []
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})
</script>

<style>
/* Optional: You can leave the map to take up the entire screen or adjust the height and width if needed */
</style>
