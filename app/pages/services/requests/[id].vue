<template>
  <UDashboardPage>
    <UDashboardPanel
      grow
      class="overflow-y-auto max-h-[calc(100vh-4rem)]"
    >
      <UDashboardNavbar
        title="Details"
        class="ml-4"
      >
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter requests..."
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
      <UCard
        class="mx-[0.5px] ring-0"
      >
        <div
          v-if="loading"
          class="flex justify-center items-center min-h-screen"
        >
          <p>Loading...</p>
        </div>
        <div v-else>
          <div
            v-if="error"
            class="text-red-500"
          >
            <p>{{ error }}</p>
          </div>
          <div v-else>
            <div class="flex flex-col space-y-4">
              <div>
                <div>
                  <p class="font-light text-gray-500">
                    <UBadge
                      class=""
                      :type="getStatusType(serviceData.servicestatuses.status)"
                    >
                      {{ serviceData.servicestatuses.status }}
                    </UBadge>
                  </p>
                </div>
              </div>
              <UDashboardCard
                :title="serviceData.servicetype.type_name"
                :links="isMobile ? [{ label: 'Read more', color: 'gray', size: 'xs', trailingIcon: 'i-heroicons-arrow-right-20-solid', click: openSlideover }] : []"
                :description="isMobile ? clampedDescription : serviceData.description"
                icon="line-md:uploading-loop"
              />
              <!-- <UPageCard
                :title="serviceData.servicetype.type_name"
                :description="serviceData.description"
                icon="line-md:uploading-loop"
                class=""
              /> -->
            </div>
            <div class="mt-2 grid grid-cols-1">
              <p class="mt-2 text-xs font-thin dark:text-gray-300 subpixel-antialiased">
                Date and time of service
              </p>
              <div class="mt-4 flex flex-row">
                <!-- <h2 class="text-sm font-light dark:text-gray-400">
                  Date:
                </h2> -->
                <p class="time-display font-mono">
                  {{ formattedDate }}
                </p>
                <p
                  v-if="serviceData.service_time"
                  class="ml-2"
                >
                  /
                  <span class="ml-2 time-display font-mono">
                    {{ serviceData.service_time }}
                  </span>
                </p>
              </div>
              <div class="mt-4 flex flex-row">
                <div
                  v-if="serviceData.service_customer_flights"
                  class="grid grid-cols-3 gap-2"
                >
                  <UFormGroup
                    label="Flight"
                    required
                  >
                    <div class="">
                      <UIcon
                        name="i-icon-park-outline:airplane"
                        class="w-3 h-3"
                      />
                      <span class="ml-2 font-black dark:text-sky-400">
                        {{ serviceData.service_customer_flights.flight_number }}
                      </span>
                    </div>
                  </UFormGroup>
                  <UFormGroup
                    label="PST"
                    required
                  >
                    <div class="">
                      <UIcon
                        name="i-icon-park-outline:time"
                        class="w-3 h-3"
                      />
                      <span class="ml-2 font-black dark:text-gray-400">
                        {{ serviceData.service_customer_flights.flight_pst }}
                      </span>
                    </div>
                  </UFormGroup>
                  <UFormGroup
                    label="Route"
                    required
                  >
                    <div class="">
                      <UIcon
                        name="i-icon-park-outline:local-pin"
                        class="w-3 h-3"
                      />
                      <span class="ml-2 font-black dark:text-gray-400">
                        {{ serviceData.service_customer_flights.flight_route }}
                      </span>
                    </div>
                  </UFormGroup>
                </div>
              </div>
              <div class="mt-4 flex flex-row space-x-2">
                <div>
                  <NuxtLink :to="`/services/requests/edit/${serviceData.id}`">
                    <UButton
                      size="xs"
                      color="primary"
                      variant="soft"
                    >
                      Edit
                    </UButton>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- //Customer info block -->
            <!-- <div class="mt-2 flex flex-col">
              <div>
                <h2 class="text-sm font-light text-gray-500">
                  Customer:
                </h2>
                <span class="text-sm font-light dark:text-slate-300">{{ serviceData.customers.full_name }}</span>
              </div>
              <div>
                <span class="text-sm font-light dark:text-slate-300">
                  {{ serviceData.customers.company_id.company_name }}
                </span>
              </div>
            </div> -->

            <!-- <div class="mt-4">
              <h2 class="font-semibold">
                Service Order:
              </h2>
              <p v-if="serviceData.service_orders.length > 0">
                {{ serviceData.service_orders[0].serial_number }}
              </p>
            </div> -->
            <!-- Display Accordion only if service_customer_items exist -->
            <div
              v-if="hasCustomerItems"
              class="mt-4"
            >
              <UAccordion
                color="primary"
                variant="soft"
                size="sm"
                :items="serviceCustomerItemsAccordion"
              />
              <!-- Display total count and weight -->
              <div class="mt-2">
                <p class="text-sm font-light">
                  Total items:
                  <span class="text-lg font-bold font-mono dark:text-red-500">{{ itemCount }}</span> pcs
                </p>
                <p class="text-sm font-light">
                  Total weight:
                  <span class="text-lg font-bold font-mono dark:text-red-500">{{ totalWeight }}</span> kg
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div v-if="serviceData && serviceData.service_orders.length > 0">
              <img
                v-if="qrCodeUrl"
                :src="qrCodeUrl"
                alt="QR Code"
                class="mt-2"
              >
              <p v-else>
                Loading QR code...
              </p>
            </div>
            <p v-else-if="serviceData && serviceData.service_orders.length === 0">
              No service orders available.
            </p>
          </div>
        </div>
      </UCard>
    </UDashboardPanel>

    <!-- Slideover for mobile view -->
    <USlideover v-model="isOpen">
      <div class="p-4 flex-1">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark-20-solid"
          class="flex sm:hidden absolute end-5 top-5 z-10"
          square
          padded
          @click="isOpen = false"
        />
        <div class="overflow-y-auto h-full">
          <p class="text-sm">
            {{ serviceData.description }}
          </p>
        </div>
      </div>
    </USlideover>
  </UDashboardPage>
</template>

<script setup lang="ts">
import QRious from 'qrious' // Import the QRious library
import { generateQRCode } from '~/utils/qrCodeUtil'

const route = useRoute()
const { id } = route.params
const { serviceData, loading, error } = useServiceById(id)
const isOpen = ref(false)
const qrCodeUrl = ref('') // This will hold the generated QR code URL

// Function to generate QR code URL
const generateQRCodeUrl = (serialNumber) => {
  const qr = new QRious({
    value: serialNumber,
    size: 200 // You can adjust the size as needed
  })
  return qr.toDataURL() // Returns the QR code as a data URL
}
// Watch for changes in serviceData
watch(serviceData, (newValue) => {
  if (newValue && newValue.service_orders.length > 0) {
    const serialNumber = newValue.service_orders[0].serial_number
    qrCodeUrl.value = generateQRCodeUrl(serialNumber) // Generate the QR code URL
  } else {
    qrCodeUrl.value = '' // Reset if no service orders
  }
})

// Method to detect if the user is on a mobile device
const isMobile = computed(() => {
  return window.innerWidth < 768 // You can adjust this breakpoint
})

const formattedDate = computed(() => {
  if (!serviceData.value || !serviceData.value.service_date) {
    return 'N/A'
  }

  const date = new Date(serviceData.value.service_date)
  return isNaN(date.getTime())
    ? 'N/A'
    : new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date)
})

const clampedDescription = computed(() => {
  // Check if serviceData and serviceData.description are defined
  if (!serviceData.value || !serviceData.value.description) {
    return '' // Return an empty string or a placeholder
  }

  const lines = serviceData.value.description.split(' ')
  return lines.length > 20 // Adjust this number based on your needs
    ? `${lines.slice(0, 20).join(' ')}...` // Clamp to 20 words or whatever logic you prefer
    : serviceData.value.description // Access the description correctly
})

onMounted(() => {
  console.log('Full serviceData object:', serviceData) // Выводим полный объект
})

// Watch to confirm reactivity of serviceData
watch(serviceData, (newData) => {
  console.log('serviceData updated in component:', newData)
})

// Method to open the slide-over
const openSlideover = () => {
  isOpen.value = true
}

const hasCustomerItems = computed(() => serviceData.value?.service_customer_item_services?.length > 0)

const serviceCustomerItemsAccordion = computed(() => {
  return serviceData.value.service_customer_item_services.map((relation) => {
    const item = relation.service_customer_items
    return {
      label: item.item_name,
      content: `
        Part Number: ${item.item_partnumber || 'NOT APPLY'}
      `
    }
  })
})

const itemCount = computed(() => serviceData.value?.service_customer_item_services?.length || 0)

// Compute the total weight from the `service_customer_item_services` array
const totalWeight = computed(() => {
  // Check if serviceData and service_customer_item_services are defined
  if (!serviceData.value || !serviceData.value.service_customer_item_services) {
    return 0
  }

  return serviceData.value.service_customer_item_services.reduce((sum, item) => {
    // Extract weight from service_customer_items.item_characteristics, defaulting to 0 if not available
    const weight = parseFloat(item.service_customer_items?.item_characteristics?.weight) || 0
    return sum + weight
  }, 0)
})

// Helper function to get Tailwind CSS classes based on status// Function to get Tailwind CSS classes based on status
// Function to determine badge type based on status
const getStatusType = (status) => {
  switch (status) {
    case 'Error':
      return 'danger' // Use appropriate type for error
    case 'Confirmed':
      return 'info' // Use appropriate type for confirmed
    case 'Completed':
      return 'success' // Use appropriate type for completed
    case 'Canceled':
      return 'warning' // Use appropriate type for in progress
    case 'Draft':
      return 'neutral' // Use appropriate type for draft
    default:
      return 'default' // Default type for unknown status
  }
}
const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    },
    {
      label: 'Requests',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: '/services/customers/requests/list'
    }
  ]
]
</script>

<style scoped>
.time-display {
  font-size: 1rem; /* Adjust size if needed */
  font-weight: bold;
  color: var(--color-primary); /* Primary color text */
  background-color: #000; /* Black background for contrast */
  padding: 0.2rem 0.5rem; /* Padding around the text */
  border-radius: 5px; /* Slight rounding on edges */
  text-align: center;
  display: inline-block;
  letter-spacing: 0.1rem;

  /* Glow and shadow effects with primary color */
  box-shadow: 0px 0px 8px rgba(var(--primary-rgb), 0.6), 0 0 15px rgba(var(--primary-rgb), 0.4);
  text-shadow: 0px 0px 3px rgba(var(--primary-rgb), 0.8), 0px 0px 5px rgba(var(--primary-rgb), 0.6);
}
.clamp-2-lines {
  display: -webkit-box;          /* Necessary for the line clamp */
  -webkit-box-orient: vertical; /* Specify vertical orientation */
  overflow: hidden;              /* Hide overflow */
  -webkit-line-clamp: 2;        /* Limit to 2 lines */
  line-height: 1.5;             /* Adjust line height for spacing */
  max-height: 3em;              /* 2 lines * line height (1.5) */
}

/* Add any styling you may want */
</style>
