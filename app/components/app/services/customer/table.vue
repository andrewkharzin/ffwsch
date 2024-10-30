<script setup lang="ts">
import { ref, computed, defineProps, reactive, watch } from 'vue'
import type { ServiceWithRelations } from '@/types/types'

const props = defineProps<{ services: ServiceWithRelations[] }>()

// Фильтры и колонки
const search = ref('')
const selectedStatus = ref<string>('All')
const columns = [
  { key: 'index', label: '#', sortable: true },
  { key: 'service_date', label: 'Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'description', label: 'Description', sortable: false }
]

const statusMap = reactive({
  '138261c0-235e-4a19-9c2c-550674045e04': { label: 'Draft', colorClass: 'bg-gray-400' },
  '656d0181-1aa8-46a0-83d8-651bfd1a4742': { label: 'Completed', colorClass: 'bg-green-500' },
  '681d9cb6-55e4-47a0-9c2c-550674045e04': { label: 'Pending', colorClass: 'bg-yellow-500' },
  '68bd4999-011a-47e3-833d-0f600db5eb48': { label: 'Confirmed', colorClass: 'bg-blue-500' },
  'b3d9ebe7-f348-4fc2-924e-f61256bf13fc': { label: 'New', colorClass: 'bg-indigo-500' },
  'b4e826c6-0b7a-43ed-b5e6-c1d7cc395d28': { label: 'Accounted', colorClass: 'bg-purple-500' },
  'c92998e3-a1b8-43eb-9c8e-74f983db45a9': { label: 'Canceled', colorClass: 'bg-red-500' },
})

const filterStatusOptions = [
  { value: 'All', label: 'All' },
  ...Object.keys(statusMap).map(key => ({
    value: key,
    label: statusMap[key].label,
  }))
]

// Функция фильтрации
const filteredServices = computed(() => {
  const statusValue = selectedStatus.value?.value || selectedStatus.value; // Получаем значение из выбранного статуса

  return props.services.filter(service => {
    const matchesDescription = search.value === '' || service.description?.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusValue === 'All' || service.status_id === statusValue
    return matchesDescription && matchesStatus
  })
})


// Проверка отфильтрованных данных при изменении фильтра
watch([search, selectedStatus], () => {
  console.log('Фильтр изменился:')
  console.log('Текущий поиск:', search.value)
  console.log('Выбранный статус:', selectedStatus.value)
  console.log('Отфильтрованные данные:', filteredServices.value)
}, { immediate: true })
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search description..." />
    <USelectMenu v-model="selectedStatus" :options="filterStatusOptions" placeholder="Status" class="w-40" />
    <NuxtLink to="/services/requests/new">
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        color="primary"
        square
        variant="solid"
      />
    </NuxtLink>
  </div>

  <!-- Таблица -->
  <UTable
    :rows="filteredServices"
    :columns="columns"
    :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }"
    class="w-full"
  >
    <template #index-data="{ row, index }">
      {{ index + 1 }}
    </template>

    <template #service_date-data="{ row }">
      {{ row.service_date ? new Date(row.service_date).toLocaleDateString('en-US') : 'N/A' }}
    </template>

    <template #status-data="{ row }">
      <span
        v-if="statusMap[row.status_id]"
        :class="`inline-flex items-center px-2 py-1 rounded text-white text-xs font-semibold ${statusMap[row.status_id].colorClass}`">
        {{ statusMap[row.status_id].label }}
      </span>
      <span v-else>Unknown Status</span>
    </template>

    <template #description-data="{ row }">
      {{ row.description || 'No Description' }}
    </template>
  </UTable>

  <!-- Отладка фильтрованных данных -->
  <!-- <div>
    <h3>Отладка фильтрованных данных:</h3>
    <pre>{{ filteredServices }}</pre>
  </div> -->
</template>
