<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Manifests"
        :badge="ffmRecords.length"
        class="ml-4"
      />
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <UCard
        class="w-full"
        :ui="{
          base: '',
          ring: '',
          divide: 'divide-y divide-gray-200 dark:divide-gray-700',
          header: { padding: 'px-4 py-5' },
          body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
          footer: { padding: 'p-4' }
        }"
      >
        <template #header>
          <h3>List</h3>
        </template>

        <!-- Filters -->
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search..."
          />
        </div>

        <!-- Header and Action buttons -->
        <div class="flex justify-between items-center w-full px-4 py-3">
          <div class="flex items-center gap-1.5">
            <span class="text-sm leading-5">Rows per page:</span>
            <USelect
              v-model="pageCount"
              :options="[3, 5, 10, 20, 30, 40]"
              class="me-2 w-20"
              size="xs"
            />
          </div>

          <div class="flex gap-1.5 items-center">
            <USelectMenu
              v-model="selectedColumns"
              :options="excludeSelectColumn"
              multiple
            >
              <UButton
                icon="i-heroicons-view-columns"
                color="gray"
                size="xs"
              >
                Columns
              </UButton>
            </USelectMenu>

            <UButton
              icon="i-heroicons-funnel"
              color="gray"
              size="xs"
              :disabled="search === ''"
              @click="resetFilters"
            >
              Reset
            </UButton>
          </div>
        </div>

        <!-- Table -->
        <UTable
          v-model="selectedRows"
          v-model:sort="sort"
          :rows="ffmRecords"
          :columns="columnsTable"
          :loading="pending"
          sort-asc-icon="i-heroicons-arrow-up"
          sort-desc-icon="i-heroicons-arrow-down"
          sort-mode="manual"
          class="w-full"
          :ui="{ td: { base: 'max-w-[0] truncate' }, default: { checkbox: { color: 'gray' as any } } }"
          @select="select"
        >
          <template #date-data="{ row }">
            <RouterLink
              class="dark:text-teal-500 text-pink-500 font-black font-mono text-lg"
            >
              {{ row.date }}
            </RouterLink>
          </template>
          <template #flight-data="{ row }">
            <RouterLink
              :to="{ name: 'ffm-id', params: { id: row.id } }"
              class="dark:text-sky-500 text-pink-500 font-bold font-mono hover:underline"
            >
              {{ row.flight }}
            </RouterLink>
          </template>
          <template #airport_from-data="{ row }">
            <RouterLink
              class="dark:text-gray-300 text-pink-500 font-black font-mono"
            >
              {{ row.airport_from }}
            </RouterLink>
          </template>
          <template #airport_to-data="{ row }">
            <p>
              {{ row.airport_from }}
              <UBadge
                variant="soft"
                color="teal"
              >
                {{ row.airport_to }}
              </UBadge>
            </p>
          </template>

          <template #actions-data="{ row }">
            <UDropdown :items="items(row)">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
              <!-- <UButton
                :label="loading ? 'Generating...' : 'FFM/5'"
                color="gray"
                variant="solid"
                :icon="loading ? 'i-heroicons-arrow-path-20-solid animate-spin' : null"
                :disabled="loading"
                @click="generateMessage(row.id)"
              /> -->
            </UDropdown>
          </template>
        </UTable>

        <!-- Pagination & Rows Display -->
        <template #footer>
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
              :ui="{
                wrapper: 'flex items-center gap-1',
                rounded: '!rounded-full min-w-[32px] justify-center',
                default: {
                  activeButton: {
                    variant: 'outline'
                  }
                }
              }"
            />
          </div>
        </template>
      </UCard>

      <!-- Modal for Generated FFM Message -->
      <UModal
        v-model="isModalOpen"
        prevent-close
      >
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="ml-4 flex-1 font-mono tracking-widest font-light leading-6 text-gray-900 dark:text-slate-500">
                Generated FFM/5
              </h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="isModalOpen = false"
              />
            </div>
          </template>
          <pre class="p-4 font-mono text-xs dark:text-gray-300">{{ generatedMessage }}</pre>
          <!-- Modal Footer with Copy Button -->
          <template #footer>
            <div class="flex justify-end p-4">
              <UButton
                color="gray"
                variant="solid"
                icon="i-heroicons-clipboard-document"
                @click="copyToClipboard"
              />
            </div>
          </template>
        </UCard>
      </UModal>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const pending = ref(true)
const loading = ref(false) // Loading state for the button
const search = ref('')
const sort = ref({ column: 'date', direction: 'asc' as const })
const page = ref(1)
const pageCount = ref(10)
const pageTotal = ref(200) // Dynamic value from API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'flight', label: 'Flight', sortable: true },
  { key: 'airport_to', label: 'A/D' },
  { key: 'actions', label: 'Actions' }
]
const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter(column => selectedColumns.value.includes(column)))
const excludeSelectColumn = computed(() => columns.filter(v => v.key !== 'select'))

const selectedRows = ref([])
function select(row) {
  const index = selectedRows.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selectedRows.value.push(row)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

const ffmRecords = ref([])
const isModalOpen = ref(false)
const generatedMessage = ref('')

const { generateFfm5Message } = useFfmMessage()
const supabase = useSupabaseClient()

const fetchFfmList = async () => {
  pending.value = true // Stop loading after data fetch
  const { data, error } = await supabase
    .from('ffm')
    .select('id, date, flight, airport_from ( iata ), airport_to ( iata )')
  if (error) {
    console.error('Error fetching FFM records:', error)
  } else {
    ffmRecords.value = data.map(record => ({
      id: record.id,
      date: record.date,
      flight: record.flight,
      airport_from: record.airport_from?.iata || 'N/A',
      airport_to: record.airport_to?.iata || 'N/A'
    }))
  }
  pending.value = false // Stop loading after data fetch
}

const generateMessage = async (ffmId) => {
  loading.value = true // Start loading animation
  generatedMessage.value = await generateFfm5Message(ffmId)
  loading.value = false // Stop loading animation
  isModalOpen.value = true
}

const resetFilters = () => {
  search.value = ''
}

onMounted(() => {
  fetchFfmList()
})

const toast = useToast()

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedMessage.value)
    .then(() => {
      toast.add({
        id: 'telex_copied',
        title: 'Telex copied to clipboard',
        description: 'The FFM/5 message has been successfully copied.',
        icon: 'i-heroicons-clipboard-check-20-solid',
        timeout: 3000
      })
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err)
      toast.add({
        id: 'copy_failed',
        title: 'Copy failed',
        description: 'Unable to copy the FFM/5 message to clipboard.',
        icon: 'i-heroicons-x-circle-20-solid',
        color: 'error',
        timeout: 3000
      })
    })
}

const links = [
  [
    {
      label: 'home',
      icon: 'i-heroicons-home',
      component: 'NuxtLink',
      to: '/'
    },
    {
      label: 'Flights',
      icon: 'i-heroicons-queue-list',
      component: 'NuxtLink',
      to: '/ffm'
    }
  ]
]

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => console.log('Edit', row.id)
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate-20-solid',
    click: () => console.log('Duplicate', row.id)
  }],
  [{
    label: loading.value ? 'Generating...' : 'FFM/5',
    icon: loading.value ? 'i-heroicons-arrow-path-20-solid animate-spin' : null,
    disabled: loading.value,
    click: () => generateMessage(row.id)
  }],
  [{
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid',
    click: () => console.log('Archive', row.id)
  }, {
    label: 'Move',
    icon: 'i-heroicons-arrow-right-circle-20-solid',
    click: () => console.log('Move', row.id)
  }],
  [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => console.log('Delete', row.id)
  }]
]
</script>
