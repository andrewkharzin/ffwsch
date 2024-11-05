// middleware/resetForm.ts

import { defineNuxtRouteMiddleware } from 'nuxt/app'
import { useServiceStore } from '../stores/serviceStore' // Ensure correct import path

export default defineNuxtRouteMiddleware((to, from) => {
  const serviceStore = useServiceStore() // Get the store instance

  // Reset form state
  if (serviceStore) {
    serviceStore.resetForm() // Call the method that resets the form
  }
  console.log('Resetting form...')
})
