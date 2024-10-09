<script setup lang="ts">
import { ref, watch, computed } from "vue";

// Props for the data passed from the parent component
const props = defineProps({
  services: Array, // All service data passed from the parent
  loading: Boolean,
  error: String,
});

// Emit events for sort and row selection
const emits = defineEmits(["sort-change", "select-row", "filter-change"]);

// State for filtering and sorting
const sort = ref({ column: "service_date", direction: "asc" as const });
const selectedCompany = ref(null); // Holds the selected company for filtering
const selectedColumns = ref([
  { key: "select", label: "", width: "30px" }, // Checkbox column
  { key: "full_name", label: "Customer", sortable: true },
  { key: "service_orders", label: "Order", sortable: false },
  { key: "service_date", label: "Service Date", sortable: true },
  { key: "type_name", label: "Type", sortable: true },
  { key: "service_status", label: "Status" },
  
]);

// Available company names for filtering, based on the services data
const companyNames = computed(() => {
  const names = props.services
    .map((service) => service.customers?.company_id?.company_name)
    .filter((name) => name !== undefined);
  return [...new Set(names)]; // Get unique company names
});

// Filtered services based on selected company
const filteredServices = computed(() => {
  if (!selectedCompany.value) {
    return props.services;
  }
  return props.services.filter(
    (service) =>
      service.customers?.company_id?.company_name === selectedCompany.value
  );
});

// Handle sorting changes
watch(sort, (newVal) => {
  emits("sort-change", newVal);
});

// Handle company filter changes
watch(selectedCompany, (newVal) => {
  emits("filter-change", newVal);
});

// Handle company selection from the CompanyFilter component
const handleCompanyUpdate = (company: string) => {
  selectedCompany.value = company;
};

const isOpen = ref(false)
const isOpenDescription = ref(false)

</script>

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
        <!-- Checkbox column -->
        <template #select-data="{ row }">
          <input type="checkbox" @change="$emit('select-row', row)" />
        </template>

        <!-- Full Name and Company Column -->
        <template #full_name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :src="row.customers.company_id.logo" size="lg" />
            <div class="flex flex-col">
              <p class="text-sm text-cyan-400">{{ row.customers.full_name }}</p>
              <p class="font-light text-xs">
                {{ row.customers.position }}
              </p>
              <span class="text-xs dark:text-gray-400 text-gray-800s">{{ row.customers.company_id.company_name }}</span>
              
            </div>
          </div>
        </template>


        <!-- Full Name and Company Column -->
        <template #service_orders-data="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex flex-col">
              <p
              @click="isOpen = true" 
              class="text-md font-bold cursor-pointer hover:text-teal-500">#{{ row.customers.number_id }}</p>
              <p v-if="row.customers.company_id" class="text-md font-light">

                <span class="text-xs dark:text-teal-300 italic">{{ row.service_orders.serial_number }}</span>
              </p>
              
              <span v-else>No company name</span>
            </div>
          </div>
          <UModal v-model="isOpen">
                <div class="p-4 text-md font-light">
                  {{ row.service_orders }}
                </div>
              </UModal>
        </template>

        <!-- Service Date Column -->
        <template #service_date-data="{ row }">
        <div class="flex flex-col">
           <div>
              <span class="text-sm font-bold text-white">
                {{ new Date(row.service_date).toLocaleDateString() }}
                <!-- Date only -->
              </span>
              <span
                class="p-[0.2rem] ml-2 text-sm text-white border-l border-gray-400"
              >
                {{
                  new Date(row.service_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
                <!-- Time (hours and minutes only) -->
              </span>
            </div>
            <div>
             <span class="mt-2 text-xs">
                {{ new Date(row.service_date).toLocaleDateString() }}
                <!-- Date only -->
              </span>
            <span
                class="text-xs"
              >
                {{
                  new Date(row.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
                <!-- Time (hours and minutes only) -->
              </span>
              
            </div>
          </div>
        </template>

        <!-- Type Name Column -->
        <template #type_name-data="{ row }">
        <div class="flex flex-col">
          <span class="cursor-poiner">{{ row.type_name }}</span>
           <div class="w-1/4">
              <div class="truncate">
                  {{ row.description }}
              </div>
          </div>
        </div>
          
        </template>

        <!-- Status Column -->
        <template #service_status-data="{ row }">
          <UBadge
            :label="row.status"
            :color="row.status === 'New' ? 'green' : 'red'"
            variant="subtle"
            class="capitalize"
          />
        </template>
      </UTable>


      <!-- Error Handling -->
      <template v-if="error">
        <p>Error: {{ error }}</p>
      </template>
</template>
