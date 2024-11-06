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
      />

      <!-- Ошибки -->
      <template v-if="error">
        <p>Error: {{ error }}</p>
      </template>
      <template v-if="companyError">
        <p>Error fetching companies: {{ companyError }}</p>
      </template>
    </UDashboardPanel>
  </UDashboardPage>
</template>
