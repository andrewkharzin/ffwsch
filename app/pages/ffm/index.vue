<template>
  <div>
    <UButton variant="soft" @click="generateMessage">Generate FFM/8 Message</UButton>
    <pre>{{ ffm8Message }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { generateFfm8Message } = useFfmMessage()
const ffm8Message = ref('')
const ffmId = '0844d5d5-ff18-43eb-abeb-8ddb483b55cb' // Replace with the actual FFM ID

const generateMessage = async () => {
  ffm8Message.value = await generateFfm8Message(ffmId)
}
</script>
