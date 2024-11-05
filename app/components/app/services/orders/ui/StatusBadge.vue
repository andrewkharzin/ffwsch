<template>
  <transition name="flip">
    <span
      v-if="visible"
      :class="[config.base, config.rounded, config.font, sizeClass, colorClass]"
    >
      {{ status }}
    </span>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  status: String,
  size: { type: String, default: 'sm' },
  variant: { type: String, default: 'solid' }
})

// Config
const config = {
  base: 'inline-flex items-center',
  rounded: 'rounded-md',
  font: 'font-medium',
  size: {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5'
  },
  variant: {
    solid: 'bg-{color}-500 dark:bg-{color}-400 text-white dark:text-gray-900',
    soft: 'bg-{color}-50 dark:bg-{color}-400 dark:bg-opacity-10 text-{color}-500 dark:text-{color}-400'
  }
}

// Status colors
const statusColors = {
  New: 'green',
  Confirmed: 'sky',
  Rejected: 'red',
  Accounted: 'orange',
  Pending: 'pink',
  Default: 'red',
  Completed: 'sky'
}

// Get color function
const getStatusColor = status => statusColors[status] || statusColors.Default

const visible = ref(true)

// Watch status for changes
watch(
  () => props.status,
  () => {
    visible.value = false
    setTimeout(() => {
      visible.value = true
    }, 300)
  }
)

// Classes
const sizeClass = computed(() => config.size[props.size])
const colorClass = computed(() => {
  const color = getStatusColor(props.status)
  return config.variant[props.variant].replace(/{color}/g, color)
})
</script>

<style scoped>
/* Flip animation */
.flip-enter-active,
.flip-leave-active {
  transition: transform 0.6s ease;
}
.flip-enter,
.flip-leave-to {
  transform: rotateX(180deg);
}
</style>
