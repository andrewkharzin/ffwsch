<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Books"
        :badge="bookings.length"
        class="ml-4"
      >
        <!-- Input for filtering users -->
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter users..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>
      <div class="p-4">
        <UTabs
          :key="tabsKey"
          v-model="activeTab"
          :items="items"
          class="w-full"
        >
          <!-- Booking Tab -->
          <template #new="{ item }">
            <UCard @submit.prevent="onSubmitBooking">
              <template #header>
                <!-- <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                  {{ item.label }}
                </p>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create a new booking here. Fill in the details and click Save.
                </p> -->
                <!-- <ULandingHero
                  :title="item.label "
                  description="Create a new booking here. Fill in the details and click Save."
                /> -->
                <UDashboardSection
                  icon="i-material-symbols:order-play"
                  :title="item.label"
                  description="Create a new booking here. Fill in the details and click Save."
                  orientation="vertical"
                  class="px-4 mt-6"
                />
              </template>

              <!-- Booking Form -->
              <!-- <AppBookingsFormsBookingForm v-model="bookingForm" /> -->
              <AppBookingsFormsNewBooking
                @on-create="addBooking"
                @open-availability="openAvailabilityTab"
                :selectAWB="selectAWB"
                @bookingCreated="handleBookingCreated"
              />

              <div v-if="loading">
                Loading bookings...
              </div>
              <div
                v-if="error"
                class="error"
              >
                {{ error }}
              </div>

              <div
                v-for="booking in bookings"
                :key="booking.id"
                class="booking"
              >
                <h2>AWB: {{ booking.awb_number?.id || 'N/A' }}</h2>
                <p>Carrier: {{ booking.awb_number?.awb_carrier || 'N/A' }}</p>
                <p>Weight: {{ booking.awb_number?.weight || 'N/A' }}</p>
                <p>Shipper: {{ booking.shipper?.fido || 'N/A' }}</p>
                <p>Consignee: {{ booking.consignee?.fido || 'N/A' }}</p>
                <p>Flight: {{ booking.flight?.flight_number || 'N/A' }}</p>
                <p>Status: {{ booking.status?.status || 'N/A' }}</p>
              </div>

              <template #footer>
                <UButton
                  type="submit"
                  color="black"
                >
                  Save Booking
                </UButton>
              </template>
            </UCard>
          </template>

          <!-- Aviability Tab (Disabled) -->
          <template #aviability="{ item }">
            <UCard>
              <template #header>
                <UDashboardSection
                  icon="i-flowbite:file-invoice-solid"
                  :title="item.label"
                  description="List of available AWBs in stock"
                  orientation="vertical"
                  class="px-4 mt-6"
                />
              </template>
              <template #default>
                <!-- Loading Indicator -->
                <div
                  v-if="pending"
                  class="flex justify-center items-center py-6"
                >
                  <span>Loading...</span>
                </div>
                <!-- AWB Table -->
                <UTable
                  v-if="!pending && ffmRecords.length"
                  :rows="ffmRecords"
                  :columns="columns"
                  class="w-full p-4 mx-auto"
                  :ui="{ td: { base: 'truncate' } }"
                >
                  <template #awb_carrier-data="{ row }">
                    <div class="flex flex-row space-x-3">
                      <span class="p-1 border-2 border-gray-500 rounded-tl-md rounded-br-md text-xs tracking-widest font-mono font-bold dark:text-pink-600">{{ row.ffm_telex[0]?.awb_carrier || 'N/A' }}</span>
                      <span class="mt-1 text-xs tracking-widest font-mono font-bold dark:text-gray-200">{{ "-" }}{{ row.ffm_telex[0]?.awb_number || 'N/A' }}</span>
                    </div>
                  </template>
                  <template #flight-data="{ row }">
                    <span>{{ row.flight || 'N/A' }}</span>
                  </template>
                  <template #airport_from-data="{ row }">
                    <div class="flex flex-col">
                      <p class="text-sm font-mono font-bold dark:text-slate-400">{{ row.airport_from.iata }}</p>
                      <span class="text-xs font-light dark:text-gray-500">{{ row.airport_from.name }}</span>

                    </div>
                  </template>
                  <template #airport_to-data="{ row }">
                    <p class="text-sm font-mono font-bold dark:text-slate-400">{{ row.airport_to.iata }}</p>
                    <span class="text-xs font-light dark:text-gray-500">{{ row.airport_to.name }}</span>
                  </template>
                  <template #actions-data="{ row }">
                    <UButton @click="selectAWB(row)">
                      Select
                    </UButton>
                  </template>
                </UTable>
                <!-- No Data Message -->
                <div
                  v-else-if="!pending && !ffmRecords.length"
                  class="text-center py-6"
                >
                  <p>No AWB records found for this user.</p>
                </div>
              </template>
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
        <!-- <AppBookingsFormsNewBooking @onCreate="addBooking" /> -->

        <!-- <div v-if="loading">Loading bookings...</div>
        <div v-if="error" class="error">{{ error }}</div>

        <div v-for="booking in bookings" :key="booking.id" class="booking">
          <h2>AWB: {{ booking.awb_number?.id || 'N/A' }}</h2>
          <p>Carrier: {{ booking.awb_number?.awb_carrier || 'N/A' }}</p>
          <p>Weight: {{ booking.awb_number?.weight || 'N/A' }}</p>
          <p>Shipper: {{ booking.shipper?.fido || 'N/A' }}</p>
          <p>Consignee: {{ booking.consignee?.fido || 'N/A' }}</p>
          <p>Flight: {{ booking.flight?.flight_number || 'N/A' }}</p>
          <p>Status: {{ booking.status?.status || 'N/A' }}</p>
        </div> -->
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref } from 'vue' // Importing necessary functions
import useAwbsDataByOwner from '../../../../composables/booking/useAwbsByOwner'

const { bookings, loading, error, fetchBookings } = useBookings()
const { ffmRecords, fetchAwbsDataByUser, pending } = useAwbsDataByOwner()
const tabsKey = ref(0)
// Assuming you're using ref to bind the input field
const awbNumberInput = ref(''); // This initializes it as an empty string

const columns = [
  { key: 'awb_carrier', label: 'Carrier' },
  { key: 'awb_number', label: 'AWB Number' },
  { key: 'flight', label: 'Flight' },
  { key: 'airport_from', label: 'From' },
  { key: 'airport_to', label: 'To' },
  { key: 'actions', label: 'Actions' }
]

const addBooking = (newBooking) => {
  bookings.value.push(newBooking)
}

onMounted(fetchBookings)

const q = ref('') // Filter input

const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    },
    {
      label: 'QBuk',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: '/services/bookings/list'
    }
  ]
]

const activeTab = ref(0) // Set to '0' initially, which points to the first tab
const isAvailabilityTabEnabled = ref(false) // Controls whether "Aviability" tab is enabled


const items = computed(() => {
  return [
    { slot: 'new', label: 'Booking' },
    { slot: 'aviability', label: 'Aviability', disabled: !isAvailabilityTabEnabled.value },
    { slot: 'tab3', label: 'Flight Export' }
  ]
})

watch(isAvailabilityTabEnabled, (newVal) => {
  console.log('isAvailabilityTabEnabled:', newVal)
  console.log('Items:', items.value)
  console.log('Initial Items:', items.value)
})

function onSubmitBooking() {
  console.log('Booking form submitted', bookingForm)
}

const openAvailabilityTab = () => {
  isAvailabilityTabEnabled.value = true // Enable the tab
  activeTab.value = 1 // Switch to the tab
  tabsKey.value += 1 // Force re-render of UTabs
  fetchAwbsDataByUser(null); // Fetch AWB data for the user
}

const selectedAWB = ref('');

const updateSelectedAWB = (awbString) => {
  selectedAWB.value = awbString;
};

const selectAWB = (record) => {
  // Update the input field with a readable format
  awbNumberInput.value = `${record.ffm_telex[0]?.awb_carrier || 'N/A'} - ${record.ffm_telex[0]?.awb_number || 'N/A'}`;

  // Update the newBooking object with the AWB ID
  newBooking.value.awb_number = record.id; // Assuming `id` is the AWB UUID
};

const newBookingFromChild = ref(null);

const handleBookingCreated = (bookingData) => {
  newBookingFromChild.value = bookingData;
  console.log('Booking received from child:', newBookingFromChild.value);
  // Further processing of the booking data can happen here
};
</script>

<style scoped>
.error {
  color: red;
}
.booking {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
