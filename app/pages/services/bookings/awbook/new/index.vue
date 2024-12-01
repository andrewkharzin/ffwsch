<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="New Airwaybill"
        class="ml-2"
      />
      <div class="p-6">
        <!-- AWB Selection -->
        <UFormGroup
          label="AWB Number"
          class="mb-4 text-sm dark:text-gray-500"
        >
          <!-- <USelect
            v-model="selectedAWB"
            :options="awbOptions"
            placeholder="Select AWB Number"
            @change="populateFields"
          /> -->
          <!-- Unselect Button -->
          <div class="mt-4">
            <UButton
              variant="soft"
              color="red"
              icon="i-mdi:clear"
              @click="unselectAWB"
            >
              clear
            </UButton>
          </div>
        </UFormGroup>
        <!-- Automatically Populated Fields -->
        <UFormGroup
          label="AWB Carrier"
          class="mb-4 text-sm dark:text-gray-500"
        >
          <UInput
            v-model="form.awb_carrier"
            readonly
          />
        </UFormGroup>
        <UFormGroup
          label="AWB Number"
          class="mb-4 text-sm dark:text-gray-500"
        >
          <UInput
            v-model="form.awb_number"
            readonly
          />
        </UFormGroup>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <UFormGroup label="Pcs">
            <UInput
              v-model="form.number_pcs"
              readonly
            />
          </UFormGroup>
          <UFormGroup label="Weight (kgs)">
            <UInput
              v-model="form.weight"
              readonly
            />
          </UFormGroup>
          <UFormGroup label="Volume (m³)">
            <UInput
              v-model="form.volume"
              readonly
            />
          </UFormGroup>
        </div>

        <!-- DGR Classes -->
        <div class="mb-4">
          <UFormGroup
            label="DGR Classes"
            class="mb-2"
          >
            <USelect
              v-model="selectedDGR"
              :options="dgrOptions"
              placeholder="Select DGR Class"
            />
          </UFormGroup>
          <UButton
            size="small"
            class="mb-2"
            @click="addDGR"
          >
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
          <UFormGroup
            label="SHCs"
            class="mb-2"
          >
            <USelect
              v-model="selectedSHC"
              :options="shcOptions"
              placeholder="Select SHC"
            />
          </UFormGroup>
          <UButton
            size="small"
            class="mb-2"
            @click="addSHC"
          >
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
        <!-- Save Button -->
        <UButton
          color="gray"
          variant="solid"
          icon="i-basil:add-outline"
          :loading="loading"
          @click="saveShipmentData"
        >
          Save Shipment
        </UButton>
        <!-- Availability Button -->
        <UButton
          color="primary"
          variant="solid"
          class="mt-4"
          @click="isOpen = true"
        >
          Availability
        </UButton>
        <!-- Availability Slideover -->
        <USlideover
          v-model="isOpen"
          prevent-close
        >
          <UCard
            class="flex flex-col flex-1"
            :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-x-mark-20-solid"
                  class="-my-1"
                  @click="isOpen = false"
                />
              </div>
            </template>

            <div class="">
              <!-- Add content for availability selection here -->
              <!-- <USelect
                v-model="selectedAWB"
                :options="awbOptions"
                placeholder="Select AWB Number"
                @change="populateFields"
              /> -->
              <div class="">
                <table class="w-full divide-y divide-gray-200 dark:divide-gray-700 border-b border-gray-600 rounded-lg">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Airline
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Number
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    <tr
                      v-for="record in awbOptions"
                      :key="record.value"
                      class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      :class="{
                        'bg-blue-100 dark:bg-blue-700': selectedAWB === record.value,
                        'hover:bg-gray-100 dark:hover:bg-gray-700': selectedAWB !== record.value
                      }"
                      @click="selectAWB(record)"
                    >
                      <td class="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-gray-200 font-mono">
                        {{ record.awb_carrier }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {{ record.awb_number }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-xs text-blue-600 dark:text-blue-400">
                        <!-- <UButton
                          variant="soft"
                          color="sky"
                          size="xs"
                          icon="i-tabler:select"
                          @click.stop="selectAWB(record)"
                        >
                          Select
                        </UButton> -->
                        <UButton
                          :variant="selectedAWB === record.value ? 'solid' : 'soft'"
                          :color="selectedAWB === record.value ? 'red' : 'sky'"
                          size="xs"
                          :icon="selectedAWB === record.value ? 'i-tabler:x' : 'i-tabler:select'"
                          @click.stop="toggleAWBSelection(record)"
                        >
                          {{ selectedAWB === record.value ? 'Unselect' : 'Select' }}
                        </UButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </UCard>
        </USlideover>
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAwbCrud } from '../../../../../composables/booking/awb/useAwbCrud'
import { useFfmTelex } from '../../../../../composables/booking/awb/useManifest'

const { shipments, shcList, dgrClasses, unList, fetchShipments, fetchRelatedData, saveShipment, loading } = useAwbCrud()
const { fetchFfmTelexRecords } = useFfmTelex()

// Slideover visibility
const isOpen = ref(false)

// Form State
const form = ref({
  awb_carrier: '',
  awb_number: '',
  number_pcs: 0,
  weight: 0.0,
  volume: 0.0,
  shc: [],
  dgr_classes: [],
  dgr_un_list: []
})

// Dropdowns
const awbRecords = ref([])
const selectedAWB = ref(null)
// Dropdown state
const selectedDGR = ref(null)
const selectedSHC = ref(null)

// Populate AWB Options
// const awbOptions = computed(() =>
//   awbRecords.value.map(record => ({ label: record.awb_number, value: record.id }))
// )
// Function to toggle selection
const toggleAWBSelection = (record) => {
  if (selectedAWB.value === record.value) {
    // Unselect if already selected
    unselectAWB();
  } else {
    // Select the new record
    selectAWB(record);
  }
};

// Function to unselect AWB
const unselectAWB = () => {
  form.value = {
    awb_carrier: '',
    awb_number: '',
    number_pcs: 0,
    weight: 0.0,
    volume: 0.0,
    shc: [],
    dgr_classes: [],
    dgr_un_list: []
  };
  selectedAWB.value = null;
  console.log('AWB unselected');
};

// Function to select AWB
const selectAWB = (record) => {
  form.value = {
    ...form.value,
    awb_carrier: record.awb_carrier || '',
    awb_number: record.awb_number || '',
    number_pcs: record.number_pcs || 0,
    weight: record.weight || 0,
    volume: record.volume || 0
  };
  selectedAWB.value = record.value;
  console.log('Selected AWB:', record);
};
const awbOptions = computed(() =>
  awbRecords.value.map(record => ({
    value: record.id,
    awb_number: record.awb_number,
    awb_carrier: record.awb_carrier,
    number_pcs: record.number_pcs,
    weight: record.weight,
    volume: record.volume
  }))
)

// Fetch Data on Mount
// const fetchRecords = async () => {
//   try {
//     awbRecords.value = await fetchFfmTelexRecords()
//     await fetchRelatedData()
//   } catch (err) {
//     console.error('Error fetching data:', err)
//   }
// }

const fetchRecords = async () => {
  try {
    awbRecords.value = await fetchFfmTelexRecords() // Fetch data from your composable
    console.log('Fetched AWB Records:', awbRecords.value) // Debugging log
    await fetchRelatedData() // Ensure related data is fetched too
  } catch (err) {
    console.error('Error fetching AWB records:', err)
  }
}

onMounted(fetchRecords)

// Populate Form Fields
const populateFields = () => {
  const selectedRecord = awbRecords.value.find(record => record.id === selectedAWB.value)
  if (selectedRecord) {
    form.value = {
      ...form.value,
      awb_carrier: selectedRecord.awb_carrier,
      awb_number: selectedRecord.awb_number,
      number_pcs: selectedRecord.number_pcs,
      weight: selectedRecord.weight,
      volume: selectedRecord.volume
    }
  }
}

// Handle Availability Selection
const handleAvailabilitySelection = () => {
  const selectedRecord = awbRecords.value.find(record => record.id === selectedAWB.value)
  if (selectedRecord) {
    form.value.selected_availability = selectedRecord.awb_number
    isOpen.value = false // Close slideover after selection
  }
}

// const selectAWB = (record) => {
//   selectedAWB.value = record.id
//   populateFields() // Populate fields based on the selected record
//   isOpen.value = false // Close the slideover after selection
// }

// Dropdown options for DGR and SHC
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

// Save Shipment Data
const saveShipmentData = async () => {
  try {
    await saveShipment(form.value)
    alert('Shipment saved successfully!')
  } catch (err) {
    alert(`Error saving shipment: ${err.message}`)
  }
}
</script>
