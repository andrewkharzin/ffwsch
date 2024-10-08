<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { Database } from "@/types/supabase";

type CustomerCompany = Database["public"]["Tables"]["customer_company"]["Row"];

const props = defineProps<{
  companyNames: CustomerCompany[];
}>();

const emits = defineEmits(["update-company"]);
const selectedCompany = ref<CustomerCompany | null>(null);

// Watch for changes in selectedCompany and emit updates
watch(selectedCompany, (newVal) => {
  emits("update-company", newVal ? newVal.company_name : null);
});

// Reset function to set the selected company to null
const resetSelection = () => {
  selectedCompany.value = null;
};
</script>

<template>
  <div>
    <USelect
      v-model="selectedCompany"
      :options="[
        { label: 'All Companies', value: null },
        ...(props.companyNames || []).map((company) => ({
          label: company.company_name,
          value: company,
        })),
      ]"
      placeholder="Select Company"
    />
  </div>
</template>
