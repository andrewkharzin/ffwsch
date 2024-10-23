<template>
  <div class="custom-select">
    <label v-if="label">{{ label }}</label>
    <select v-model="selectedValue" @change="handleChange" :required="required">
      <option value="" disabled selected>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.type_name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  label: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedValue = ref(props.modelValue)

watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue
  }
)

const handleChange = () => {
  emit('update:modelValue', selectedValue.value)
}
</script>

<style scoped>
.custom-select {
  display: flex;
  flex-direction: column;
}

.custom-select label {
  margin-bottom: 0.5rem;
}

.custom-select select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
