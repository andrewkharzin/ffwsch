<script setup lang="ts">
import { ref, computed } from "vue";
import { Database } from "@/types/supabase";

// Types for Service and CustomerCompany from Supabase types
type Service = Database["public"]["Tables"]["services"]["Row"];
type CustomerCompany = Database["public"]["Tables"]["customer_company"]["Row"];

// State variables
const q = ref(""); // Query string for filtering services
const selected = ref<Service[]>([]); // Selected rows
const selectedStatuses = ref<string[]>([]); // Selected statuses filter
const selectedLocations = ref<string[]>([]); // Selected locations filter
const selectedCompany = ref<CustomerCompany | null>(null); // Selected company filter
const sort = ref({ column: "service_date", direction: "asc" as const }); // Sorting configuration

// Use the useServices composable
const { services, loading, error } = useServices();
const {
  companies: companyNames,
  loading: loadingCompanies,
  error: companyError,
} = useCompany();

// Computed property for generating the query based on filters
const query = computed(() => {
  console.log("Query updated:", {
    q: q.value,
    statuses: selectedStatuses.value,
    locations: selectedLocations.value,
    company: selectedCompany?.company_name || null,
    sort: sort.value.column,
    order: sort.value.direction,
  });
  return {
    q: q.value,
    statuses: selectedStatuses.value,
    locations: selectedLocations.value,
    company: selectedCompany?.company_name || null, // Company filter
    sort: sort.value.column,
    order: sort.value.direction,
  };
});

// Handle sorting changes
type SortOrder = { column: string; direction: "asc" | "desc" };
const handleSortChange = (newSort: SortOrder) => {
  sort.value = newSort;
};

// Handle company filter changes
const handleFilterChange = (companyName: string | null) => {
  selectedCompany.value =
    companyNames.value?.find(
      (company) => company.company_name === companyName
    ) || null;
};

// Handle row selection
const handleRowSelect = (selectedRows: Service[]) => {
  selected.value = selectedRows;
  console.log("Selected rows: ", selectedRows);
};

const links = [
  [
    {
      label: "home",
      icon: "i-heroicons-home",
      component: "NuxtLink",
      to: `/`,
    },
    {
      label: "Orders",
      icon: "i-heroicons-queue-list",
      component: "NuxtLink",
      to: `/services/orders`,
    },
  ],
  [
    {
      label: "Documentation",
      icon: "i-heroicons-book-open",
      to: "https://ui.nuxt.com/pro",
      target: "_blank",
    },
  ],
];
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Services" :badge="services.length">
        <template #right>
          <UInput
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter services..."
            class="hidden lg:block"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <!-- Toolbar with columns selection and company filter -->
      <UDashboardToolbar>
        <template #left>
          <USelectMenu
            v-model="selectedColumns"
            icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns"
            multiple
          >
            <template #label> Display </template>
          </USelectMenu>
        </template>

        <!-- Add the company filter to the toolbar, aligned to the right -->
        <template #right>
          <AppServicesOrdersUiCompanyFilter
            :companyNames="
              companyNames?.length ? companyNames : ['No companies available']
            "
            @update-company="handleFilterChange"
          />
        </template>
      </UDashboardToolbar>

      <!-- Display services table with sorting, filtering, and selection -->
      <AppServicesOrdersTable
        :services="services"
        :loading="loading"
        :error="error"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @select-row="handleRowSelect"
      />

      <!-- Error Handling for Services -->
      <template v-if="error">
        <p>Error: {{ error }}</p>
      </template>
      <!-- Error Handling for Companies -->
      <template v-if="companyError">
        <p>Error fetching companies: {{ companyError }}</p>
      </template>
    </UDashboardPanel>
  </UDashboardPage>
</template>
