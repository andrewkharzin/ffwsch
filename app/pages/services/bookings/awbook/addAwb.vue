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
        <UInput
          v-model="form.number_of_pieces"
          type="number"
        />
      </UFormGroup>
      <UFormGroup label="Weight (kgs)">
        <UInput
          v-model="form.gross_weight"
          type="number"
        />
      </UFormGroup>
      <UFormGroup label="Volume (m³)">
        <UInput
          v-model="form.volume"
          type="number"
        />
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
          class="text-sm px-2 py-1 rounded"
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
          class="text-sm px-2 py-1 rounded"
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
import { ref, onMounted } from 'vue'
import { useAwbCrud } from '../../../../composables/booking/awb/useAwbCrud'

const {
  shcList,
  dgrClasses,
  loading,
  fetchRelatedData,
  saveShipment
} = useAwbCrud()

// Form state
const form = ref({
  proper_name: '',
  number_of_pieces: 0,
  gross_weight: 0.0,
  volume: 0.0,
  dgr_classes: [],
  shc: []
})

// Dropdown state
const selectedDGR = ref(null)
const selectedSHC = ref(null)

// Dropdown options
const dgrOptions = computed(() => dgrClasses.value.map(dgr => ({
  label: `${dgr.icao_class} - ${dgr.description}`,
  value: dgr.id
})))

const shcOptions = computed(() => shcList.value.map(shc => ({
  label: `${shc.code} - ${shc.description}`,
  value: shc.id
})))

// Add DGR to form
const addDGR = () => {
  const dgr = dgrClasses.value.find(item => item.id === selectedDGR.value)
  if (dgr && !form.value.dgr_classes.some(item => item.id === dgr.id)) {
    form.value.dgr_classes.push(dgr)
  }
  selectedDGR.value = null
}

// Add SHC to form
const addSHC = () => {
  const shc = shcList.value.find(item => item.id === selectedSHC.value)
  if (shc && !form.value.shc.some(item => item.id === shc.id)) {
    form.value.shc.push(shc)
  }
  selectedSHC.value = null
}

// Submit form
const submitForm = async () => {
  try {
    loading.value = true
    await saveShipment({
      ...form.value,
      shc: form.value.shc.map(shc => shc.id),
      dgr_classes: form.value.dgr_classes.map(dgr => dgr.id),
      dgr_un_list: [] // Add this if needed
    })
    alert('Shipment added successfully!')
    form.value = {
      proper_name: '',
      number_of_pieces: 0,
      gross_weight: 0.0,
      volume: 0.0,
      dgr_classes: [],
      shc: []
    }
  } catch (err) {
    alert(`Error adding shipment: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// Fetch related data on mount
onMounted(() => {
  fetchRelatedData()
})
</script>
