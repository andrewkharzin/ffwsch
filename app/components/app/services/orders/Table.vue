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
        <UAvatar :src="row.customers?.company_id.logo" :size="avatarSize" />
        <div class="flex flex-col">
          <p :style="{ fontSize: textSize }">
            {{ row.customers?.full_name }}
          </p>

          <p class="font-light text-xs">
            {{ row.customers?.position }}
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
      <div class="flex flex-col cursor-pointer" @click="openSlideover(row)">
        <span class="hover:text-teal-500">
          <!-- Условие для отображения иконки вместо текста -->
          <template
            v-if="row.servicetype.type_name === 'Погрузка/Разгрузка техаптечек'"
          >
            <Icon icon="mdi:airplane-alert" width="25px" />
          </template>
          <template v-else>
            {{ row.servicetype.type_name }}
          </template>
        </span>
      </div>
    </template>

    <!-- Status Column -->
    <template #service_status-data="{ row }">
      <UBadge
        :label="row.servicestatuses.status"
        :color="
          row.status === 'New'
            ? 'green'
            : row.status === 'Confirmed'
            ? 'sky'
            : row.status === 'Accounted'
            ? 'orange'
            : row.status === 'Pending'
            ? 'gray'
            : 'red'
        "
        :variant="row.status === 'Confirmed' ? 'solid' : 'outline'"
        class="capitalize"
      />
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
          <div style="max-height: 160px; overflow-y: auto">
            <p style="white-space: pre-line; line-height: 1.5">
              {{ selectedService?.description }}
            </p>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-3">
          <UAvatar
            v-if="selectedService.customers.profile?.avatar_url"
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
      </div>

      <template #footer>
        <UButton label="Close" @click="isOpen = false" />
      </template>
    </UCard>
  </USlideover>

  <template v-if="error">
    <p>Error: {{ error }}</p>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { Icon } from "@iconify/vue";

const isMobile = useMediaQuery("(max-width: 768px)");

const avatarSize = computed(() => (isMobile.value ? "xs" : "lg"));
const textSize = computed(() => (isMobile.value ? "0.6rem" : "sm"));

const supabase = useSupabaseClient();

const props = defineProps({
  services: Array,
  loading: Boolean,
  error: String,
});

const emits = defineEmits(["sort-change", "filter-change"]);

const sort = ref({ column: "service_date", direction: "asc" as const });
const selectedCompany = ref(null);
const selectedColumns = ref([
  { key: "select", label: "", width: "30px" },
  { key: "full_name", label: "Customer", sortable: true },
  { key: "type_name", label: "Type", sortable: true },
  { key: "service_status", label: "Status" },
]);

const companyNames = computed(() => {
  return [
    ...new Set(
      props.services
        .map((s) => s.customers?.company_id?.company_name)
        .filter(Boolean)
    ),
  ];
});

const filteredServices = computed(() => {
  return selectedCompany.value
    ? props.services.filter(
        (s) => s.customers?.company_id?.company_name === selectedCompany.value
      )
    : props.services;
});

watchEffect(() => {
  emits("sort-change", sort.value);
});

watchEffect(() => {
  emits("filter-change", selectedCompany.value);
});

const isOpen = ref(false);
const selectedService = ref([]);

const openSlideover = async (service: any) => {
  try {
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select(
        `
        id, service_type_id, servicetype(type_name), description, service_date,
        customers(full_name, company_id:customer_company(company_name, logo), user_id),
        service_orders(serial_number)
      `
      )
      .eq("id", service.id)
      .single();

    if (serviceError) {
      console.error("Error fetching service details:", serviceError.message);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", serviceData.customers.user_id)
      .single();

    if (profileError) {
      console.error("Error fetching customer profile:", profileError.message);
    }

    selectedService.value = {
      ...serviceData,
      customers: {
        ...serviceData.customers,
        profile: profileData,
      },
    };

    isOpen.value = true;
  } catch (err) {
    console.error("Error fetching service details:", err);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
</script>
