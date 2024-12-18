<script setup lang="ts">
import { ref, computed } from 'vue'

// Получаем данные сервисов и компаний
const { services, loading, error } = useServices()
const {
  companies: companyNames,
  loading: loadingCompanies,
  error: companyError
} = useCompany()

// Переменная для ID выбранной компании
const selectedCompanyId = ref(null)
const selectedRows = ref([])
const newStatus = ref('')
const rejectionReason = ref('') // Reason for rejectio
const statusOptions = ref([
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Completed', value: 'Completed' },
])

// Computed property to check if rows are selected
const isRowSelected = computed(() => selectedRows.value.length > 0)

const isStatusDialogOpen = ref(false)
const isRejectDialogOpen = ref(false) // Manage visibility of reject mo

const updateSelectedRows = (rows) => {
  selectedRows.value = rows
  console.log("Selected Rows:", selectedRows.value) // Check selected rows
}

const closeStatusDialog = () => {
  isStatusDialogOpen.value = false
}

console.log('Company Names:', companyNames)
console.log('Services:', services)

// Фильтрация сервисов по выбранной компании
const filteredServices = computed(() => {
  console.log('Selected Company ID:', selectedCompanyId.value)

  // Получаем название выбранной компании
  const selectedCompanyName = companyNames.value.find(
    company => company.id === selectedCompanyId.value
  )?.company_name

  console.log('Selected Company Name:', selectedCompanyName) // Логируем имя выбранной компании

  const filtered = services.value.filter((service) => {
    console.log('Service:', service) // Логируем каждый сервис

    // Получаем имя компании из объекта service.customers
    const companyName = service.customers?.company_id.company_name // Используем опциональную цепочку, чтобы избежать ошибок
    console.log(
      'companyName Fetched from service.customers?.company_id.company_name :',
      companyName
    ) // Логируем каждый сервис

    // Если companyName не определено, то это значит, что сервис не привязан к компании
    if (!companyName) {
      console.warn(`Company name is undefined for service ID: ${service.id}`)
    }

    const match = selectedCompanyName
      ? companyName === selectedCompanyName // Сравнение по имени компании
      : true

    console.log(
      `Comparing service.company_name ${companyName} with selectedCompanyName ${selectedCompanyName}: ${match}`
    )
    return match
  })

  console.log('Filtered Services:', filtered) // Лог результатов фильтрации
  return filtered
})
const changeStatus = async () => {
  try {
    const supabase = useSupabaseClient()
    const serviceIds = selectedRows.value.map(row => row.id)

    // Update the selected services' status in the database
    const { data, error } = await supabase
      .from('services')
      .update({ service_status: newStatus.value })
      .in('id', serviceIds)

    if (error) {
      console.error('Error updating status:', error)
      return
    }

    // Close the dialog after updating
    closeStatusDialog()

    // Optionally, reload services or update the state
    // to reflect the status change
  } catch (err) {
    console.error('Error changing status:', err)
  }
}

// Function to reject selected services with a reason
const rejectSelectedRequests = async () => {
  try {
    const supabase = useSupabaseClient()
    const serviceIds = selectedRows.value.map(row => row.id)
    const { error } = await supabase
      .from('services')
      .update({ service_status: 'Rejected', reason: rejectionReason.value })
      .in('id', serviceIds)

    if (!error) {
      closeRejectDialog()
      rejectionReason.value = '' // Reset reason after rejection
    }
  } catch (err) {
    console.error('Error rejecting requests:', err)
  }
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Services"
        :badge="services.length"
      />

      <!-- Toolbar with company filter -->
      <UDashboardToolbar>
        <template #right>
          <!-- <USelect
            v-model="selectedCompanyId"
            :options="
              companyNames.map((company) => ({
                label: company.company_name,
                value: company.id
              }))
            "
            placeholder="Select Company"
          /> -->
          <USelect
            v-model="selectedCompanyId"
            :options="[
              { label: 'All', value: null }, // Adding the 'All' option
              ...companyNames.map((company) => ({
                label: company.company_name,
                value: company.id
              }))
            ]"
            placeholder="Select Company"
          />
        </template>
      </UDashboardToolbar>

      <!-- Таблица сервисов -->
      <AppServicesOrdersTable
        :services="filteredServices"
        :loading="loading"
        :error="error"
        @row-selection="updateSelectedRows"
      />

      <!-- Ошибки -->
      <template v-if="error">
        <p>Error: {{ error }}</p>
      </template>
      <template v-if="companyError">
        <p>Error fetching companies: {{ companyError }}</p>
      </template>

      <!-- Status Dialog -->
      <UDialog v-if="isStatusDialogOpen" @close="closeStatusDialog">
        <template #header>
          <h3>Select Status</h3>
        </template>
        <template #body>
          <USelect v-model="newStatus" :options="statusOptions" />
        </template>
        <template #footer>
          <UButton label="Cancel" @click="closeStatusDialog" />
          <UButton label="Confirm" @click="changeStatus" />
        </template>
      </UDialog>

      <!-- Reject Request Dialog -->
      <UDialog v-if="isRejectDialogOpen" @close="closeRejectDialog">
        <template #header>
          <h3>Reject Request</h3>
        </template>
        <template #body>
          <label for="rejection-reason" class="block text-sm">Reason for Rejection:</label>
          <UInput id="rejection-reason" v-model="rejectionReason" placeholder="Enter reason for rejection" />
        </template>
        <template #footer>
          <UButton label="Cancel" @click="closeRejectDialog" />
          <UButton label="Confirm" color="red" @click="rejectSelectedRequests" />
        </template>
      </UDialog>
    </UDashboardPanel>
  </UDashboardPage>
</template>
