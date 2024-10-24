<template>
  <USelect
    v-model="selectedCompany"
    :options="
      companyNames.map((company) => ({
        label: company.company_name,
        value: company // Ensure you are selecting the entire company object
      }))
    "
    placeholder="Select Company"
    @change="handleCompanyChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useServiceFilterStore } from '@@/stores/services/useServiceFilterStore'
import type { Database } from '@/types/supabase'

const props = defineProps<{
  companyNames: Database['public']['Tables']['customer_company']['Row'][]
}>()

const filterStore = useServiceFilterStore() // Correctly get the store instance
const selectedCompany = ref(filterStore.selectedCompany) // Initialize from store

// Watch for changes in the selectedCompany ref
watch(selectedCompany, (newValue) => {
  console.log('Company selected:', newValue) // Log selected company
  filterStore.updateSelectedCompany(newValue) // Update the store
})

// Handle the company selection change
const handleCompanyChange = (company) => {
  console.log('Selected company from dropdown:', company) // Log selected company
  selectedCompany.value = company // Update local state
  filterStore.updateSelectedCompany(company) // Ensure the store updates
  console.log('Updated selectedCompany in store:', filterStore.selectedCompany) // Log the updated
}
</script>
