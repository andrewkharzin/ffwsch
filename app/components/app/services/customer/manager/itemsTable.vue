<script lang="ts" setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

// Define props for items and selectedItems
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  selectedItems: {
    type: Array,
    required: true
  }
})

// Emit event to parent component
const emit = defineEmits(['update:selectedItems', 'add-to-service-request'])

// Local reference for selected items to track changes in the table
const localSelectedItems = ref([...props.selectedItems])

// Sync changes from parent component's selectedItems prop
watch(() => props.selectedItems, (newSelectedItems) => {
  localSelectedItems.value = [...newSelectedItems]
})

// Emit events to update selected items in the parent component
const toggleItemSelection = (itemId) => {
  const index = localSelectedItems.value.indexOf(itemId)
  if (index === -1) {
    localSelectedItems.value.push(itemId)
  } else {
    localSelectedItems.value.splice(index, 1)
  }
  emit('update:selectedItems', localSelectedItems.value)
}

// Columns management
const columns = ref([
  { key: 'select', label: 'Select', sortable: false },
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'description', label: 'Description', sortable: true },
  { key: 'partnumber', label: 'Part Number', sortable: true },
  { key: 'completed', label: 'Status', sortable: true } // Additional column
])

const selectedColumns = ref(columns.value.map(column => column.key)) // Initialize selected columns

// Computed property to filter columns based on selection
const columnsTable = computed(() => {
  return columns.value.filter(column => selectedColumns.value.includes(column.key))
})

// Function to toggle column visibility
const toggleColumn = (columnKey) => {
  if (selectedColumns.value.includes(columnKey)) {
    selectedColumns.value = selectedColumns.value.filter(key => key !== columnKey) // Disable column
  } else {
    selectedColumns.value.push(columnKey) // Enable column
  }
}

// Prepare options for column selection
const columnOptions = computed(() =>
  columns.value.map(column => ({
    value: column.key,
    label: column.label
  }))
)

// Selected Rows
const selectedRows = ref([])

function select(row) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selectedRows.value.push(row)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

// Filters
const search = ref('')
const todoStatus = [{
  key: 'uncompleted',
  label: 'In Stock',
  value: false
}, {
  key: 'completed',
  label: 'Out of Stock',
  value: true
}]
const selectedStatus = ref([])

const resetFilters = () => {
  search.value = ''
  selectedStatus.value = []
}

// Pagination
const sort = ref({ column: 'id', direction: 'asc' as const })
const page = ref(1)
const pageCount = ref(10)
const pageTotal = ref(200) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

// Data
const { data: todos, status } = await useLazyAsyncData('todos', () => ($fetch as any)('https://jsonplaceholder.typicode.com/todos', {
  query: {
    q: search.value,
    _page: page.value,
    _limit: pageCount.value,
    _sort: sort.value.column,
    _order: sort.value.direction
  }
}), {
  default: () => [],
  watch: [page, search, pageCount, sort]
})
// Computed property to count selected rows
const selectedCount = computed(() => localSelectedItems.value.length)
</script>

<template>
  <div>
    <!-- Column Selection -->
    <div class="flex gap-2 mb-2">
      <USelectMenu
        v-model="selectedColumns"
        :options="columnOptions"
        multiple
      >
        <UButton
          color="gray"
          size="xs"
        >
          Select Columns
        </UButton>
      </USelectMenu>
      <!-- Search and Filters -->
      <div class="flex items-center justify-between gap-3">
        <UInput
          v-model="search"
          placeholder="Search..."
        />
        <USelectMenu
          v-model="selectedStatus"
          :options="todoStatus"
          multiple
          placeholder="Status"
          class="w-40"
        />
        <UButton @click="resetFilters">
          Reset
        </UButton>
      </div>
    </div>

    <!-- Table with data rows from items -->
    <UTable
      v-model="selectedRows"
      :rows="props.items"
      :columns="columnsTable"
      @select="select"
    >
      <template #cell(select)="data">
        <input
          type="checkbox"
          :checked="localSelectedItems.includes(data.item.id)"
          @change="toggleItemSelection(data.item.id)"
        >
      </template>
      <template #completed-data="{ row }">
        <UBadge
          size="xs"
          :label="row.completed ? 'Completed' : 'In Progress'"
          :color="row.completed ? 'emerald' : 'orange'"
          variant="subtle"
        />
      </template>
    </UTable>
    <!-- Pagination -->
    <div class="flex flex-wrap justify-between items-center">
      <div>
        <span class="text-sm leading-5">
          Showing
          <span class="font-medium">{{ pageFrom }}</span>
          to
          <span class="font-medium">{{ pageTo }}</span>
          of
          <span class="font-medium">{{ pageTotal }}</span>
          results
        </span>
      </div>

      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="pageTotal"
      />
    </div>
    <!-- Updated Button with Count -->
    <UButton
      class="mt-4"
      color="blue"
      @click="$emit('add-to-service-request')"
    >
      Add to Service Request
      <span class="ml-2">{{ selectedCount }}</span>
    </UButton>
  </div>
</template>
