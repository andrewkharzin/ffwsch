<template>
  <div>
    <UButton :loading="isLoading" @click="generateMessage">
      Generate FFM/5 Message
    </UButton>
    <pre>{{ ffm5Message }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

// Define props
const props = defineProps<{ ffmId: string }>()

// Use composable and set up ref to hold the message
const { generateFfm5Message } = useFfmMessage()
const ffm5Message = ref('')
const isLoading = ref(false) // Loading state for the button

// Method to generate the FFM/5 message
const generateMessage = async () => {
  isLoading.value = true // Set loading state to false once done
  ffm5Message.value = await generateFfm5Message(props.ffmId)
  isLoading.value = false // Set loading state to false once done
}
</script>
