<!-- /components/UserServiceTable.vue -->
<template>
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
            class="p-[0.2rem] ml-2 text-sm text-white border-l border-gray-400"
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
          <AppServicesOrdersUiHighlightedText
            :text="selectedService?.description || ''"
          />
          <span>{{ selectedService?.context_tags }}</span>
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
import { useSupabaseClient } from '@supabase/vue'

const isMobile = useMediaQuery('(max-width: 768px)')
const avatarSize = computed(() => (isMobile.value ? 'xs' : 'sm'))
const textSize = computed(() => (isMobile.value ? '0.6rem' : 'sm'))
const supabase = useSupabaseClient()

const props = defineProps({
  services: Array,
  loading: Boolean,
  error: String,
  userId: String // Pass userId to filter services created by this user
})

const emits = defineEmits(['sort-change', 'filter-change'])
const sort = ref({ column: 'service_date', direction: 'asc' as const })
const selectedCompany = ref(null)
const selectedColumns = ref([
  { key: 'select', label: '', width: '30px' },
  { key: 'full_name', label: 'Customer', sortable: true },
  { key: 'type_name', label: 'Type', sortable: true },
  { key: 'service_status', label: 'Status' }
])

const filteredServices = computed(() => {
  // Filter services by the userId
  return props.services.filter(s => s.customers?.user_id === props.userId)
})

const isOpen = ref(false)
const selectedService = ref([])
const openSlideover = async (service: any) => {
  try {
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select(
        'id, servicetype(type_name), description, service_date, customers(full_name, company_id:customer_company(company_name, logo), user_id), service_orders(serial_number), service_equipment (type, number)'
      )
      .eq('id', service.id)
      .single()

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
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const shortenFullName = (fullName: string) => {
  if (!fullName) return ''
  const parts = fullName.split(' ')
  if (parts.length >= 3) {
    const lastName = parts[0]
    const firstNameInitial = parts[1][0] + '.'
    const middleNameInitial = parts[2][0] + '.'
    return `${lastName} ${firstNameInitial}${middleNameInitial}`
  } else if (parts.length === 2) {
    const lastName = parts[0]
    const firstNameInitial = parts[1][0] + '.'
    return `${lastName} ${firstNameInitial}`
  }
  return fullName
}
</script>
