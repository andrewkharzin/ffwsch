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
        <UAvatar :src="row.customers.company_id.logo" size="lg" />
        <div class="flex flex-col">
          <p class="text-sm text-cyan-400">{{ row.customers.full_name }}</p>
          <p class="font-light text-xs">{{ row.customers.position }}</p>
          <span class="text-xs dark:text-gray-400 text-gray-800">
            {{ row.customers.company_id.company_name }}
          </span>
        </div>
      </div>
    </template>

    <!-- Service Orders Column -->
    <template #service_orders-data="{ row }">
      <div class="flex items-center gap-3">
        <div class="flex flex-col">
          <p
            @click="isOpen = true"
            class="text-md font-bold cursor-pointer hover:text-teal-500"
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
          <span class="text-sm font-bold text-white">
            {{ new Date(row.service_date).toLocaleDateString() }}
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
          </span>
        </div>
      </div>
    </template>

    <!-- Type Name Column -->
    <template #type_name-data="{ row }">
      <div @click="openSlideover(row)" class="flex flex-col cursor-pointer">
        <span class="hover:text-teal-500">{{ row.type_name }}</span>
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

  <!-- Slide-over for service details -->
  <USlideover v-model="isOpen">
    <UCard
      class="flex flex-col flex-1 w-[100%] max-w-[700px]"
      :ui="{
        body: { base: 'flex-1' },
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <h3 class="p-1 text-sm font-bold">{{ selectedService?.type_name }}</h3>
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
          <!-- Service Date -->
          <time class="text-sm text-gray-500">{{
            selectedService?.service_date
          }}</time>
        </div>
        <div>
          <!-- Service Description with line clamp to prevent overflow -->
          <p class="line-clamp-4 leading-relaxed">
            {{ selectedService?.description }}
          </p>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <UAvatar
            v-if="
              selectedService.customers.profile &&
              selectedService.customers.profile.avatar_url
            "
            :src="selectedService.customers.profile.avatar_url"
            size="lg"
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
        <!-- Display the serial number -->
        <!-- <div v-if="selectedService?.service_orders?.length">
          <span class="uppercase text-sm font-mono">
            {{ selectedService?.service_orders[0]?.serial_number }}
          </span>
        </div>
        <div v-else>NOORDES</div> -->
        <!-- <div>
          <img
            v-if="
              selectedService.customers.profile &&
              selectedService.customers.profile.avatar_url
            "
            :src="selectedService.customers.profile.avatar_url"
            alt="Profile Image"
            class="profile-avatar"
          />
          <p v-else>No profile image available</p>
        </div> -->
      </div>

      <template #footer>
        <UButton label="Close" @click="isOpen = false" />
      </template>
    </UCard>
  </USlideover>

  <!-- Error Handling -->
  <template v-if="error">
    <p>Error: {{ error }}</p>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const supabase = useSupabaseClient();
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
const selectedCompany = ref(null);
const selectedColumns = ref([
  { key: "select", label: "", width: "30px" },
  { key: "full_name", label: "Customer", sortable: true },
  { key: "service_date", label: "Service Date", sortable: true },
  { key: "type_name", label: "Type", sortable: true },
  { key: "service_status", label: "Status" },
]);

// Available company names for filtering
const companyNames = computed(() => {
  const names = props.services
    .map((service) => service.customers?.company_id?.company_name)
    .filter((name) => name !== undefined);
  return [...new Set(names)];
});

// Filtered services
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

// Slide-over state
const isOpen = ref(false);
const selectedService = ref<any>(null); // Holds the selected service for the slide-over

// Function to open the slide-over with selected row data
// const openSlideover = (service: any) => {
//   selectedService.value = service;
//   isOpen.value = true;
// };

const openSlideover = async (service: any) => {
  try {
    // Fetch the service by ID, including related customer and company data
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select(
        `
        id,
        description,
        service_date,
        servicetype (type_name),
        customers (
          full_name,
          company_id:customer_company(company_name, logo),
          user_id
        ),
        service_orders (serial_number)
      `
      )
      .eq("id", service.id)
      .single();

    console.log("Service data:", serviceData); // Log service data to check if it's being fetched correctly

    if (serviceError) {
      console.error("Error fetching service details:", serviceError.message);
      return;
    }

    // Fetch the customer's profile based on the user_id
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", serviceData.customers.user_id)
      .single();

    console.log("Profile data:", profileData); // Log profile data to ensure the avatar_url is present

    if (profileError) {
      console.error("Error fetching customer profile:", profileError.message);
    }

    // Combine service data with profile data
    selectedService.value = {
      ...serviceData,
      customers: {
        ...serviceData.customers,
        profile: profileData, // Attach profile data to the customer
      },
    };

    console.log("Selected service with profile:", selectedService.value); // Log final combined data

    isOpen.value = true;
  } catch (err) {
    console.error("Error fetching service details:", err);
  }
};
</script>
<style scoped>
/* Custom styles for readability */
.line-clamp-4 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.line-clamp-10 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10;
  overflow: hidden;
}

@media (max-width: 768px) {
  .max-w-[700px] {
    max-width: 100%;
  }
}
</style>