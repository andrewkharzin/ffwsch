<template>
  <div class="p-6 max-w-md mx-auto">
    <!-- Proper Shipping Name -->
    <UFormGroup label="Proper Shipping Name" class="mb-4">
      <UInput
        v-model="form.proper_name"
        placeholder="Enter name"
      />
    </UFormGroup>

    <!-- Pcs, Weight, Volume -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <UFormGroup label="Pcs">
        <UInput v-model="form.number_of_pieces" type="number" />
      </UFormGroup>
      <UFormGroup label="Weight (kgs)">
        <UInput v-model="form.gross_weight" type="number" />
      </UFormGroup>
      <UFormGroup label="Volume (m³)">
        <UInput v-model="form.volume" type="number" />
      </UFormGroup>
    </div>

    <!-- DGR Classes -->
    <div class="mb-4">
      <UFormGroup label="DGR Classes" class="mb-2">
        <USelect
          v-model="selectedDGR"
          :options="dgrOptions"
          placeholder="Select DGR Class"
        />
      </UFormGroup>
      <UButton size="small" class="mb-2" @click="addDGR">
        Add DGR Class
      </UButton>
      <div class="flex flex-wrap space-x-2">
        <span
          v-for="dgr in form.dgr_classes"
          :key="dgr.id"
          class="text-sm px-2 py-1 rounded bg-blue-200"
        >
          {{ dgr.icao_class }}
        </span>
      </div>
    </div>

    <!-- SHCs -->
    <div class="mb-4">
      <UFormGroup label="SHCs" class="mb-2">
        <USelect
          v-model="selectedSHC"
          :options="shcOptions"
          placeholder="Select SHC"
        />
      </UFormGroup>
      <UButton size="small" class="mb-2" @click="addSHC">
        Add SHC
      </UButton>
      <div class="flex flex-wrap space-x-2">
        <span
          v-for="shc in form.shc"
          :key="shc.id"
          class="text-sm px-2 py-1 rounded bg-green-200"
        >
          {{ shc.code }}
        </span>
      </div>
    </div>

    <!-- Add Shipment Button -->
    <UButton
      class="w-full"
      size="large"
      :loading="loading"
      @click="submitForm"
    >
      ADD SHIPMENT
    </UButton>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
defineProps({
  form: Object,
  dgrClasses: {
    type: Array,
    default: () => [] // Prevent undefined errors
  },
  shcList: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

// Events
defineEmits(['submit'])

// State for dropdowns
const selectedDGR = ref(null)
const selectedSHC = ref(null)

// Computed options for dropdowns
const dgrOptions = computed(() =>
  dgrClasses.map(dgr => ({
    label: `${dgr.icao_class} - ${dgr.description}`,
    value: dgr.id
  }))
)

const shcOptions = computed(() =>
  shcList.map(shc => ({
    label: `${shc.code} - ${shc.description}`,
    value: shc.id
  }))
)

// Add DGR to the form
const addDGR = () => {
  const dgr = dgrClasses.find(item => item.id === selectedDGR.value)
  if (dgr && !form.dgr_classes.some(item => item.id === dgr.id)) {
    form.dgr_classes.push(dgr)
  }
  selectedDGR.value = null
}

// Add SHC to the form
const addSHC = () => {
  const shc = shcList.find(item => item.id === selectedSHC.value)
  if (shc && !form.shc.some(item => item.id === shc.id)) {
    form.shc.push(shc)
  }
  selectedSHC.value = null
}

// Submit the form
const submitForm = () => {
  emit('submit', {
    ...form,
    shc: form.shc.map(shc => shc.id),
    dgr_classes: form.dgr_classes.map(dgr => dgr.id),
    dgr_un_list: [] // Add this if needed
  })
}
</script>
