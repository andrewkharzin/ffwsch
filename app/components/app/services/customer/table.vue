<script setup lang="ts">
import { defineProps, reactive } from 'vue'
import type { ServiceWithRelations } from '@/types/types'

// Define props for receiving services data
const props = defineProps<{ services: ServiceWithRelations[] }>()
// Status mapping: maps each status_id to a label and color for UBadge
// Status map with Tailwind CSS color classes
const statusMap = reactive({
  '138261c0-235e-4a19-9b1f-c4ef8afe8529': { label: 'Draft', colorClass: 'bg-gray-400' },
  '656d0181-1aa8-46a0-83d8-651bfd1a4742': { label: 'Completed', colorClass: 'bg-green-500' },
  '681d9cb6-55e4-47a0-9c2c-550674045e04': { label: 'Pending', colorClass: 'bg-yellow-500' },
  '68bd4999-011a-47e3-833d-0f600db5eb48': { label: 'Confirmed', colorClass: 'bg-blue-500' },
  'b3d9ebe7-f348-4fc2-924e-f61256bf13fc': { label: 'New', colorClass: 'bg-indigo-500' },
  'b4e826c6-0b7a-43ed-b5e6-c1d7cc395d28': { label: 'Accounted', colorClass: 'bg-purple-500' },
  'c92998e3-a1b8-43eb-9c8e-74f983db45a9': { label: 'Canceled', colorClass: 'bg-red-500' },
})
console.log('Received services in simple table:', props.services) // Log data to verify
console.log('Status Map:', statusMap)
</script>

<template>
  <table border="1" cellspacing="0" cellpadding="8">
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Status</th>
        <th>Customer</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(service, index) in props.services" :key="service.id">
        <td>{{ index + 1 }}</td>
        <td>{{ new Date(service.service_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
        <!-- Debugging output for status_id -->
        <!-- Directly output status_id to confirm it's in statusMap -->
        <td>
          <span v-if="statusMap[service.status_id]"
                :class="`inline-flex items-center px-2 py-1 rounded text-white text-xs font-semibold ${statusMap[service.status_id].colorClass}`">
            {{ statusMap[service.status_id].label }}
          </span>
          <span v-else>
            Status not found (ID: {{ service.status_id || 'undefined' }})
          </span>
        </td>

        <td>{{ service.customers?.full_name || 'N/A' }}</td>
        <td>{{ service.description || 'No Description' }}</td>
      </tr>
      <tr v-if="!props.services.length">
        <td colspan="5">No items found</td>
      </tr>
    </tbody>
  </table>
</template>