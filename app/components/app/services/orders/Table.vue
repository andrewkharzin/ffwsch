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
    <!-- Checkbox Column for Row Selection -->
    <template #select-data="{ row }">
      <UCheckbox
        :value="selectedRows.includes(row.id)"
        :label="''"
        @update:model-value="(isSelected) => toggleRowSelection(row.id, isSelected)"
      />
    </template>

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
          <p v-if="row.customers.company_id" class="text-md font-light">
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
          <span class="text-md font-black ordinal slashed-zero tabular-nums tracking-widest">
            <span class="border-2 rounded-lg border-pink-400 dark:border-teal-500 p-[0.3rem] text-lg text-pink-600 dark:text-teal-400">{{ new Date(row.service_date).toLocaleDateString().split('/')[0] }}</span>/
            <span>{{ new Date(row.service_date).toLocaleDateString().split('/')[1] }}</span>/
            <span>{{ new Date(row.service_date).toLocaleDateString().split('/')[2] }}</span>
          </span>
        </div>
      </div>
    </template>

    <!-- Type Name Column -->
    <template #type_name-data="{ row }">
      <div class="flex flex-col cursor-pointer" @click="openSlideover(row)">
        <span class="hover:dark:text-teal-500 hover:text-pink-600">
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
    <UCard class="flex flex-col flex-1 w-[100%] max-w-[700px]" :ui="{ body: { base: 'flex-1' } }">
      <template #header>
        <div class="flex flex-row">
          <div>
            <h3 class="p-1 text-sm font-bold">{{ selectedService?.type_name }}</h3>
            <div>
              <time class="text-md font-black dark:text-teal-500 ordinal slashed-zero tabular-nums tracking-widest">
                {{ formatDate(selectedService?.service_date) }}
              </time>
            </div>
          </div>
          <div class="ml-4 flex flex-row-reverse">
            <UBadge variant="soft" class="mt-2">
              {{ selectedService.servicestatuses?.status || 'Pending' }}
            </UBadge>
          </div>
        </div>
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
          <div style="max-height: 300px; overflow-y: auto">
            <AppServicesOrdersUiHighlightedText :text="selectedService?.description || ''" />
            <span>{{ selectedService?.context_tags }}</span>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <UAvatar v-if="selectedService.customers.profile?.avatar_url" :src="selectedService.customers.profile.avatar_url" size="sm" />
          <div class="flex flex-col">
            <p class="mt-2 text-sm text-gray-300">{{ selectedService?.customers?.full_name }}</p>
            <span class="text-xs text-gray-400">{{ selectedService?.customers?.company_id?.company_name }}</span>
          </div>
        </div>
        <p class="text-sm dark:text-gray-600">Service equipments</p>
        <div class="flex flex-col space-y-4">
          <template v-if="selectedService.service_equipment?.length">
            <UCard v-for="equipment in selectedService.service_equipment" :key="equipment.number" class="pb-2">
              <div class="flex">
                <div class="flex-none w-8">
                  <Icon icon="material-symbols-light:conveyor-belt-rounded" style="font-size: 24px" />
                </div>
                <span class="mt-0 text-sm dark:text-gray-100">{{ equipment.type }}</span>
              </div>
              <div />
            </UCard>
          </template>
          <template v-else>
            <p>No service equipment available.</p>
          </template>
        </div>
      </div>
      <div class="flex justify-end gap-4"></div>

      <template #footer>
        <div class="flex justify-between items-center w-full space-x-4">
          <!-- Close button on the left -->
          <UButton label="Close" @click="isOpen = false" />

          <!-- Confirm and Reject buttons on the right -->
          <div class="flex space-x-2">
            <UButton color="primary" variant="solid" @click="handleStatusAction('Confirmed')">
              Confirm
            </UButton>
            <UButton
              :color="'red'"
              variant="ghost"
              :loading="loadingReject"
              @click="handleStatusAction('Rejected')"
            >
              Reject
            </UButton>
          </div>
        </div>
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

const showReasonModal = ref(false)
const rejectionReason = ref('')

const loadingReject = ref(false)



const toast = useToast()
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
  { key: 'service_orders', label: 'Service Orders', sortable: true },
  { key: 'service_date', label: 'Service Date', sortable: true },
  { key: 'type_name', label: 'Type Name', sortable: true },
  { key: 'service_status', label: 'Status', sortable: true }
])

const selectedRows = ref([])
const isOpen = ref(false)
const selectedService = ref(null)

// Define the toggleRowSelection function
const toggleRowSelection = (rowId, isSelected) => {
  if (isSelected) {
    selectedRows.value.push(rowId);
  } else {
    selectedRows.value = selectedRows.value.filter(id => id !== rowId);
  }
};

const openSlideover = (service) => {
  selectedService.value = service
  rejectionReason.value = '' // Reset rejection reason
  isOpen.value = true

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

// const handleStatusAction = (status) => {
//   if (status === 'Rejected') {
//     rejectionReason.value = '' // Reset reason before showing m
//     showReasonModal.value = true
//   } else {
//     updateStatus(status)
//   }
// }

const handleStatusAction = async (status) => {
  if (status === 'Rejected') {
    loadingReject.value = true // Set loading state to true when Reject is clicked
  }

  await updateStatus(status)

  if (status === 'Rejected') {
    loadingReject.value = false // Reset loading state once update is complete
  }
}

const getStatusId = async (statusName) => {
  const { data } = await supabase.from('servicestatuses').select('id').eq('status', statusName).single()
  return data.id
}

const updateStatus = async (status) => {
  const statusId = await getStatusId(status) // Get the correct status ID for "Rejected"
  const { data, error } = await supabase
    .from('services')
    .update({ status_id: statusId }) // Update only the status_id
    .eq('id', selectedService.value.id)

  if (error) {
    console.error("Failed to update status:", error.message)
    toast.add({
      title: 'Error',
      description: 'Failed to update service status.',
      color: 'red',
      icon: 'i-heroicons-exclamation-circle',
    })
  } else {
    console.log("Service updated:", data)
    toast.add({
      title: 'Status Updated',
      description: `Service status updated to ${status}.`,
      color: 'teal',
      icon: 'i-heroicons-check-circle',
    })
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date)
}

const filteredServices = computed(() => {
  if (selectedCompany.value) {
    return props.services.filter(service => service.customers.company_id === selectedCompany.value)
  }
  return props.services
})
</script>

<style scoped>
/* Any scoped styling for specific components here */
</style>
