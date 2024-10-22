<script setup lang="ts">
import { ref, watch } from 'vue'
import Vue3TimePicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:model-value'])

const selectedTime = ref(props.modelValue || '12:00')

watch(selectedTime, (newValue) => {
  emit('update:model-value', newValue)
})
</script>

<template>
  <div>
    <!-- Apply a custom class to the TimePicker for better styling -->
    <Vue3TimePicker
      v-model="selectedTime"
      format="HH:mm:ss"
      manual-input
      hide-header
      class=""
    />
  </div>
</template>

<style scoped>
.custom-timepicker {
  /* Customize the input box to match the rest of the form */
  background-color: #1f2937; /* Dark background */
  color: #f3f4f6; /* Light text */
  border: 1px solid #38bdf8; /* Border matching your form */
  padding: 8px;
  border-radius: 4px;
  width: 100%; /* Full width */
  box-sizing: border-box;
}

.custom-timepicker input {
  background-color: transparent;
  color: inherit;
  border: none;
}

.custom-timepicker input:focus {
  outline: none;
}

.custom-timepicker .vue3-time-picker__input-container {
  padding: 0;
}

.custom-timepicker .vue3-time-picker__clock-icon {
  color: #38bdf8; /* Icon color */
}

/* Additional customization for dropdown, hover states, etc., if needed */
</style>
