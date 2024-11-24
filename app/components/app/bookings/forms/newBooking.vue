<template>
  <!-- Fist tab content start -->
  <div class="flex flex-col space-y-4">
    <!-- AWB Input and Modal Trigger -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">AWB</label>
      <div class="flex flex-row space-x-4">
        <UInput
          v-model="awbNumberInput"
          placeholder="xxx-xxxxxxxx"
          class="w-24 mt-2"
          :readonly="true"
        />
        <UButton
          icon="i-material-symbols-light:docs-add-on"
          variant="soft"
          @click="emitOpenAvailability"
        />
      </div>
    </div>

    <!-- Other Inputs for Booking -->
    <div>
      <label class="text-xs dark:text-gray-300 font-thin uppercase">Type</label>
      <USelect
        v-model="bookType"
        :options="bookTypes"
        placeholder="Select Book Type"
        class="w-full mt-2"
      />
    </div>

    <!-- Shipper and Consignee Selectors -->
    <div class="flex space-x-4">
      <div>
        <label class="text-xs dark:text-gray-300 font-thin">Shipper</label>
        <USelect
          v-model="newBooking.shipper_id"
          :options="shippers"
          placeholder="Select Shipper"
          class="mt-2"
        />
      </div>
      <div>
        <label class="text-xs dark:text-gray-300 font-thin">Consignee</label>
        <USelect
          v-model="newBooking.consignee_id"
          :options="consignees"
          placeholder="Select Consignee"
          class="mt-2"
        />
      </div>
    </div>

    <!-- Flight and Status Inputs -->
    <div class="flex space-x-4">
      <div>
        <label class="text-xs dark:text-gray-300 font-thin">Flight</label>
        <UInput
          v-model="newBooking.flight"
          placeholder="Enter Flight"
          class="mt-2 w-56"
        />
      </div>
      <div>
        <label class="text-xs dark:text-gray-300 font-thin">Booking Status</label>
        <USelect
          v-model="newBooking.status"
          :options="statuses"
          placeholder="Select Status"
          class="mt-2 w-20"
        />
      </div>
    </div>

    <div>
      <UButton
        :loading="isSubmitting"
        @click="handleCreateBooking"
      >
        Create
      </UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useAwbsDataByOwner from '../../../../composables/booking/useAwbsByOwner'

const emit = defineEmits();

const supabase = useSupabaseClient()

// State management
const awbNumberInput = ref('')
const newBooking = ref({
  awb_number: null,
  book_type: 'ONE_LEG',
  shipper_id: null,
  consignee_id: null,
  flight: '',
  status: null
})

// Modal state
const isOpen = ref(false)

// State variables for AWB selection
const selectedAWB = ref(null)
const isSubmitting = ref(false)

defineProps(['selectedAWB']);
// defineEmits(['awbSelected']);

watch(
  () => selectedAWB,
  (newValue) => {
    awbNumberInput.value = newValue;
  }
);

// Data for dropdowns
const awbNumbers = ref([])
const pending = ref(false) // Declare the loading state

const shippers = ref([])
const consignees = ref([])
const statuses = ref([])
const bookTypes = ref([]) // Array to hold valid book types
const awbRecords = ref([]) // Holds the AWB records fetched from the composable

// Fetch data for AWBs based on the current user (you might get `userId` from the context or prop)
const { fetchAwbsDataByUser, ffmRecords } = useAwbsDataByOwner()
const userId = '1b188549-ac24-43f4-9b2e-ec1058fafa20' // Replace with actual user ID
// Handle the selection of AWB
// Assuming awbNumbers contains an `id` that is a UUID
// Function to handle selection of AWB
const selectAWB = (record) => {
  // Construct the string as `awb_carrier - awb_number`
  awbNumberInput.value = `${record.ffm_telex[0]?.awb_carrier || 'N/A'} - ${record.ffm_telex[0]?.awb_number || 'N/A'}`;
};


// Fetch dropdown data (AWB numbers, shippers, consignees, statuses)
const fetchOptions = async () => {
  try {
    // Fetching AWB data and using 'id' as the value (UUID)
    const { data: awbData } = await supabase.from('ffm_telex').select('awb_carrier, awb_number, id')
    awbNumbers.value = awbData?.map(awb => ({
      label: `${awb.awb_carrier}-${awb.awb_number}`, // Display label with carrier and number
      value: awb.id // Store the UUID (id) as the value
    })) || []

    // Fetch Book Types (enum values)
    const { data, error } = await supabase.rpc('get_enum_values', { enum_type: 'book_type' })
    if (error) {
      console.error('Error fetching enum values:', error)
    } else {
      bookTypes.value = data.map(value => ({
        label: value, // Enum values are the labels
        value: value // Enum values themselves as the value
      }))
    }

    // Fetching shipper data
    const { data: shipperData } = await supabase.from('shippers').select('id, fido')
    shippers.value = shipperData?.map(shipper => ({ label: shipper.fido, value: shipper.id })) || []

    // Fetching consignee data
    const { data: consigneeData } = await supabase.from('consignees').select('id, fido')
    consignees.value = consigneeData?.map(consignee => ({ label: consignee.fido, value: consignee.id })) || []

    // Fetching status data
    const { data: statusData } = await supabase.from('bookstatus').select('id, status')
    statuses.value = statusData?.map(status => ({ label: status.status, value: status.id })) || []
  } catch (error) {
    console.error('Error fetching options:', error.message)
  }
}

// Handle booking creation
const handleCreateBooking = async () => {
  isSubmitting.value = true;
  try {
    const { data, error } = await supabase
      .from('awbs')
      .insert(newBooking.value) // Insert new booking
      .select()
      .single();

    if (error) throw error;

    // Emit newBooking data to the parent
    emit('bookingCreated', newBooking.value);

    // Reset form after submission
    newBooking.value = {
      awb_number: null,
      book_type: 'ONE_LEG',
      shipper_id: null,
      consignee_id: null,
      flight: '',
      status: null
    };
    awbNumberInput.value = ''; // Reset input
    alert('Booking created successfully');
  } catch (error) {
    console.error('Error creating booking:', error.message);
  } finally {
    isSubmitting.value = false;
  }
};



// Fetch options on mount
onMounted(fetchOptions)

// Multy Tab config
const activeTab = ref(0) // Default to the first tab
const isAvailabilityTabEnabled = ref(false) // Controls whether the "Availability" tab is enabled

const items = [
  {
    label: 'New Booking',
    icon: 'i-heroicons-information-circle',
    content: 'This is the content for the New Booking tab'
  },
  {
    label: 'Availability',
    icon: 'i-heroicons-eye-dropper',
    content: '', // Will be replaced with the modal content
    disabled: () => !isAvailabilityTabEnabled.value
  }
]

// Emitting an event from the child component to notify the parent to open the Availability tab
const emitOpenAvailability = () => {
  emit('open-availability'); // Emitting custom event
}
</script>

<style scoped>
.selected {
  background-color: #dbeafe;
  cursor: pointer;
}

li {
  padding: 0.5rem;
  margin: 0.2rem 0;
  cursor: pointer;
  border: 1px solid #ccc;
}

li:hover {
  background-color: #f3f4f6;
}
.custom-modal .sm\:max-w-lg {
  max-width: 1200px !important; /* Adjust modal width */
}

.custom-modal {
  height: 80vh !important; /* Adjust modal height */
}
</style>
