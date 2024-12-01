<script setup lang="ts">
import { ref, onMounted } from 'vue'  // Make sure ref is properly imported
import useAwbsDataByOwner from '../../../../composables/booking/useAwbsByOwner'

const supabase = useSupabaseClient()
const awbNumberInput = ref('')  // Ref for the AWB input field
const newBooking = ref({
  awb_number: null,
  book_type: 'ONE_LEG',
  shipper_id: null,
  consignee_id: null,
  flight: '',
  status: null
})

const isOpen = ref(false)
const isSubmitting = ref(false)
const pending = ref(false)
const awbRecords = ref([]) // Reactive variable for AWB records
const shippers = ref([])
const consignees = ref([])
const statuses = ref([])
const bookTypes = ref([])

// Fetch AWBs and Options
const { fetchAwbsDataByUser, ffmRecords } = useAwbsDataByOwner()

const fetchOptions = async () => {
  try {
    const [awbData, bookTypesData, shipperData, consigneeData, statusData] = await Promise.all([
      supabase.from('ffm_telex').select('awb_carrier, awb_number, id'),
      supabase.rpc('get_enum_values', { enum_type: 'book_type' }),
      supabase.from('shippers').select('id, fido'),
      supabase.from('consignees').select('id, fido'),
      supabase.from('bookstatus').select('id, status')
    ])

    awbRecords.value = awbData.data?.map(awb => ({
      label: `${awb.awb_carrier}-${awb.awb_number}`,
      value: awb.id
    })) || []

    bookTypes.value = bookTypesData.data?.map(type => ({
      label: type,
      value: type
    })) || []

    shippers.value = shipperData.data?.map(shipper => ({
      label: shipper.fido,
      value: shipper.id
    })) || []

    consignees.value = consigneeData.data?.map(consignee => ({
      label: consignee.fido,
      value: consignee.id
    })) || []

    statuses.value = statusData.data?.map(status => ({
      label: status.status,
      value: status.id
    })) || []
  } catch (error) {
    console.error('Error fetching options:', error)
  }
}

// AWB Modal Handlers
const openAWBModal = async () => {
  isOpen.value = true
  pending.value = true
  await fetchAwbsDataByUser(null)
  awbRecords.value = [...ffmRecords.value]
  pending.value = false
}

const closeAWBModal = () => {
  isOpen.value = false
}

const selectAWB = (row) => {
  awbNumberInput.value = `${row.awb_carrier}-${row.awb_number}`
  closeAWBModal()
}

// Booking Creation
const handleCreateBooking = async () => {
  isSubmitting.value = true
  try {
    const { data, error } = await supabase.from('awbs').insert(newBooking.value).select().single()
    if (error) throw error
    newBooking.value = {
      awb_number: null,
      book_type: '',
      shipper_id: null,
      consignee_id: null,
      flight: '',
      status: null
    }
    if (props.onCreate) props.onCreate(data)
  } catch (error) {
    console.error('Error creating booking:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Fetch options on mounted
onMounted(fetchOptions)
</script>

<template>
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
          @click="openAWBModal"
        />
      </div>
    </div>
  </div>
</template>