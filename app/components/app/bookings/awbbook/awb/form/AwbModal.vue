<template>
  <!-- Custom Modal Layout -->
  <div v-if="showModal" class="custom-modal-overlay" @click.self="closeModal">
    <div class="custom-modal">
      <div class="custom-modal-header">
        <h3>Select Availability</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
      <div class="custom-modal-body">
        <!-- Table to display AWB records -->
        <UTable
          v-if="!pending"
          :items="ffmRecords"
          :columns="columns"
          @row:click="selectAvailability"
        />
        <div v-else>Loading...</div>
        <div v-if="error" class="text-red-500">{{ error }}</div>
      </div>
      <div class="custom-modal-footer">
        <!-- Close button in footer -->
        <UButton color="gray" variant="ghost" @click="closeModal">Close</UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAwbsDataByOwner } from '../../../../../../composables/booking/useAwbsByOwner'; // Adjust path if necessary

// Props from parent component
const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  }
});

// Emit events to parent
const emit = defineEmits(['update:showModal', 'selectAvailability']);

// Modal visibility state
const showModal = ref(props.showModal);

// Columns for the AWB table
const columns = [
  { key: 'awb_number', label: 'AWB Number', sortable: true },
  { key: 'awb_carrier', label: 'AWB Carrier', sortable: true },
  { key: 'number_pcs', label: 'Pcs', sortable: true },
  { key: 'weight', label: 'Weight (kgs)', sortable: true },
  { key: 'volume', label: 'Volume (m³)', sortable: true }
];

// Data for availability (AWB records)
const { ffmRecords, fetchAwbsDataByUser, pending, error } = useAwbsDataByOwner();

// Fetch AWB records when the modal is opened (you can pass a user ID if needed)
const fetchAvailabilityData = async () => {
  const userId = 'someUserId'; // Replace with actual user ID if required
  await fetchAwbsDataByUser(userId);
};

// Fetch data on mounted if modal is open
onMounted(() => {
  if (props.showModal) {
    fetchAvailabilityData();
  }
});

// Handle selection from the table
const selectAvailability = (row) => {
  emit('selectAvailability', row); // Emit selected AWB record to the parent
  closeModal(); // Close modal after selection
};

// Close the modal by emitting an event to the parent
const closeModal = () => {
  emit('update:showModal', false); // Emit update to parent to close the modal
};
</script>

<style scoped>
/* Modal overlay */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

/* Modal container */
.custom-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 60%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Modal header */
.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.custom-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

/* Modal body */
.custom-modal-body {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

/* Modal footer */
.custom-modal-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
