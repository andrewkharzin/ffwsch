<template>
  <!-- Table displaying filtered services -->
  <UTable
    v-model:sort="sort"
    :rows="filteredServices"
    :columns="selectedColumns"
    :loading="loading"
    sort-mode="manual"
    class="w-full"
  >
    <!-- Full Name and Company Column -->
    <template #full_name-data="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar
          :src="row.customers?.company_id.logo"
          :size="avatarSize"
        />
        <div class="flex flex-col">
          <p :style="{ fontSize: textSize }">
            {{ shortenFullName(row.customers?.full_name) }}
          </p>

          <!-- <p class="font-light text-xs">
            {{ row.customers?.position }}
          </p> -->
          <span class="text-xs dark:text-gray-400 text-gray-800">
            {{ row.customers?.company_id.company_name }}
          </span>
        </div>
      </div>
    </template>

    <!-- Service Orders Column -->
    <template #service_orders-data="{ row }">
      <div class="flex items-center gap-3">
        <div class="flex flex-col">
          <p
            class="text-md font-bold cursor-pointer hover:text-teal-500"
            @click="isOpen = true"
          >
            #{{ row.customers.number_id }}
          </p>
          <p
            v-if="row.customers.company_id"
            class="text-md font-light"
          >
            <span class="text-xs dark:text-teal-300 italic">
              {{ row.service_orders.serial_number }}
            </span>
          </p>
          <span v-else>No company name</span>
        </div>
      </div>
    </template>

    <!-- Service Date Column -->
    <template #service_date-data="{ row }">
      <div class="flex flex-col">
        <div>
          <span class="text-sm font-bold text-white">
            {{ new Date(row.service_date).toLocaleDateString() }}
          </span>
          <span
            class="p-[0.2rem] ml-2 text-xs text-white border rounded-md border-gray-400"
          >
            {{
              new Date(row.service_date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })
            }}
          </span>
        </div>
      </div>
    </template>

    <!-- Type Name Column -->
    <template #type_name-data="{ row }">
      <div
        class="flex flex-col cursor-pointer"
        @click="openSlideover(row)"
      >
        <span class="hover:text-teal-500">
          <div class="flex flex-wrap">
            {{ row.servicetype.type_name }}
          </div>
        </span>
      </div>
    </template>

    <!-- Status Column -->
    <template #service_status-data="{ row }">
      <div>
        <AppServicesOrdersUiStatusBadge
          :status="row.servicestatuses.status"
          size="sm"
          variant="soft"
        />
      </div>
    </template>
  </UTable>

  <!-- Slide-over for service details -->
  <USlideover v-model="isOpen">
    <UCard
      class="flex flex-col flex-1 w-[100%] max-w-[700px]"
      :ui="{ body: { base: 'flex-1' } }"
    >
      <template #header>
        <h3 class="p-1 text-sm font-bold">
          {{ selectedService?.type_name }}
        </h3>
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
      </template>

      <div class="p-2 text-md font-light space-y-4">
        <div>
          <time class="text-sm text-gray-500">{{
            formatDate(selectedService?.service_date)
          }}</time>
        </div>
        <div>
          <div style="max-height: 180px; overflow-y: auto">
            <AppServicesOrdersUiHighlightedText
              :text="selectedService?.description || ''"
            />
            <span>{{ selectedService?.context_tags }}</span>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <UAvatar
            v-if="selectedService.customers.profile?.avatar_url"
            :src="selectedService.customers.profile.avatar_url"
            size="sm"
          />
          <div class="flex flex-col">
            <p class="mt-2 text-sm text-gray-300">
              REQ: {{ selectedService?.customers?.full_name }}
            </p>
            <span class="text-xs text-gray-400">{{
              selectedService?.customers?.company_id?.company_name
            }}</span>
          </div>
        </div>
        <p class="text-sm dark:text-gray-600">
          Service equipments
        </p>
        <div class="flex flex-col space-y-4">
          <template v-if="selectedService.service_equipment?.length">
            <UCard
              v-for="equipment in selectedService.service_equipment"
              :key="equipment.number"
              class="pb-2"
            >
              <div class="flex">
                <div class="flex-none w-8">
                  <Icon
                    icon="material-symbols-light:conveyor-belt-rounded"
                    style="font-size: 24px"
                  />
                </div>
                <span class="mt-0 text-sm dark:text-gray-100">{{
                  equipment.type
                }}</span>
              </div>
              <div />
            </UCard>
          </template>
          <template v-else>
            <p>No service equipment available.</p>
          </template>
        </div>
      </div>

      <template #footer>
        <UButton
          label="Close"
          @click="isOpen = false"
        />
      </template>
    </UCard>
  </USlideover>

  <template v-if="error">
    <p>Error: {{ error }}</p>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Icon } from '@iconify/vue'

const isMobile = useMediaQuery('(max-width: 768px)')

const avatarSize = computed(() => (isMobile.value ? 'xs' : 'sm'))
const textSize = computed(() => (isMobile.value ? '0.6rem' : 'sm'))

const supabase = useSupabaseClient()

const props = defineProps({
  services: Array,
  loading: Boolean,
  error: String
})

const emits = defineEmits(['sort-change', 'filter-change'])

const sort = ref({ column: 'service_date', direction: 'asc' as const })
const selectedCompany = ref(null)
const selectedColumns = ref([
  { key: 'select', label: '', width: '30px' },

  { key: 'full_name', label: 'Customer', sortable: true },
  { key: 'service_date', label: 'Date', width: '30px' },
  { key: 'service_time', label: 'Time', width: '30px' },
  { key: 'type_name', label: 'Type', sortable: true },
  { key: 'service_status', label: 'Status' }
])

const statusColors = {
  New: 'green', // зелёный
  Confirmed: 'white', // голубой
  Accounted: 'orange', // оранжевый
  Pending: '#9CA3AF', // серый
  Default: 'black' // красный
}

const row = ref({}) // Динамически наполняем

const getStatusColor = (status) => {
  return statusColors[status] || statusColors.Default
}

const companyNames = computed(() => {
  return [
    ...new Set(
      props.services
        .map(s => s.customers?.company_id?.company_name)
        .filter(Boolean)
    )
  ]
})

const filteredServices = computed(() => {
  return props.services.filter((service) => {
    const matchesCompany = selectedCompany.value
      ? service.customers?.company_id?.company_name
      === selectedCompany.value.company_name
      : true
    // Apply other filters (statuses, locations, etc.) as needed
    return matchesCompany
  })
})

watchEffect(() => {
  emits('sort-change', sort.value)
})

watchEffect(() => {
  emits('filter-change', selectedCompany.value)
})

const isOpen = ref(false)
const selectedService = ref([])

const openSlideover = async (service: any) => {
  try {
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select(
        `
        id, service_type_id, servicetype(type_name), description, service_date, context_tags,
        customers(full_name, company_id:customer_company(company_name, logo), user_id),
        service_orders(serial_number),
        service_equipment (service_id, type, number, date_in, date_out, time_in, time_out, descriptions)
      `
      )
      .eq('id', service.id)
      .single()

    console.log('SelectedService', serviceData)
    if (serviceError) {
      console.error('Error fetching service details:', serviceError.message)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', serviceData.customers.user_id)
      .single()

    if (profileError) {
      console.error('Error fetching customer profile:', profileError.message)
    }

    selectedService.value = {
      ...serviceData,
      customers: {
        ...serviceData.customers,
        profile: profileData
      }
    }

    isOpen.value = true
  } catch (err) {
    console.error('Error fetching service details:', err)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(date)
}

// Add this method in your <script setup> block
const shortenFullName = (fullName: string) => {
  if (!fullName) return ''

  const parts = fullName.split(' ')

  if (parts.length >= 3) {
    const lastName = parts[0] // Full last name
    const firstNameInitial = parts[1][0] + '.' // First name initial
    const middleNameInitial = parts[2][0] + '.' // Middle name initial
    return `${lastName} ${firstNameInitial}${middleNameInitial}`
  } else if (parts.length === 2) {
    const lastName = parts[0]
    const firstNameInitial = parts[1][0] + '.'
    return `${lastName} ${firstNameInitial}`
  }

  return fullName // Return full name if there's only one part
}

// function removeVerticalSpaces(text) {
//   return text.replace(/^\s*[\r\n]/gm, "").trim();
// }
// // Подсветка данных в описании
// const highlightText = (text: string) => {
//   return text
//     .replace(
//       /\b(\d+x\d+x\d+)\b/g,
//       '<span class="highlight-dimension">$1</span>'
//     )
//     .replace(/\b(\d+\s?(кг|kg))\b/g, '<span class="highlight-weight">$1</span>')
//     .replace(
//       /\b(\d{2}.\d{2}.\d{4})\b/g,
//       '<span class="highlight-date">$1</span>'
//     )
//     .replace(/\b(\d{2}:\d{2})\b/g, '<span class="highlight-time">$1</span>')
//     .replace(
//       /(\+?\d{1,3}[-\s]?\d{1,3}[-\s]?\d{2,3}[-\s]?\d{2,3}[-\s]?\d{2,3})/g,
//       '<span class="highlight-phone">$1</span>'
//     );
// };
</script>
