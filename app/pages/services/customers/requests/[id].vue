<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        :title="`Service Details: ${service?.id || ''}`"
        class="ml-4"
      />

      <div
        v-if="loading"
        class="p-4 text-center"
      >
        Loading service details...
      </div>

      <div
        v-else-if="service"
        class="p-4 space-y-4"
      >
        <h2 class="text-xl font-semibold">
          {{ service.full_name }}
        </h2>
        <p><strong>Service Type:</strong> {{ serviceTypeLabel }}</p>
        <p><strong>Date:</strong> {{ formatDate(service.service_date) }}</p>
        <p><strong>Status:</strong> {{ statusLabel }}</p>
        <p><strong>Description:</strong> {{ service.description || 'No description provided' }}</p>
      </div>

      <div
        v-else
        class="p-4 text-center text-red-500"
      >
        Service not found
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { useServiceStore } from '~/stores/serviceStore'

// Route params
const route = useRoute()
const serviceId = route.params.id as string

// State variables
const service = ref(null)
const loading = ref(true)

// Use Pinia store for mapped status labels
const serviceStore = useServiceStore()

// Helper function for formatting dates
const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

// Fetch service details on mount
onMounted(async () => {
  loading.value = true
  const { data, error } = await useSupabaseClient()
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (error) {
    console.error('Error fetching service:', error.message)
    service.value = null
  } else {
    service.value = data
  }

  loading.value = false
})

// Computed labels for service type and status
const serviceTypeLabel = computed(() =>
  serviceStore.serviceTypes.find(type => type.id === service.value?.service_type_id)?.type_name || 'Unknown'
)
const statusLabel = computed(() =>
  serviceStore.statuses.find(status => status.id === service.value?.status_id)?.label || 'Unknown'
)
</script>

<style scoped>
</style>
