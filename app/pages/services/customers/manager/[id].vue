<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'

const route = useRoute()
const router = useRouter()
const serviceId = route.params.id

const items = ref([]) // Holds all items created by the user
const selectedItems = ref([])

// Get the current user
const user = useSupabaseUser()
const user_id = ref(user?.value?.id) // Ensure user_id is available

const supabase = useSupabaseClient()

// Fetch all items created by the current user
const fetchUserItems = async () => {
  try {
    const { data, error } = await supabase
      .from('service_customer_items')
      .select('*')
      .eq('user_id', user_id.value) // Fetch items created by the current user
    if (error) throw error

    items.value = data.map(item => ({
      id: item.id,
      name: item.item_name,
      description: item.item_description,
      partnumber: item.item_partnumber,
      characteristics: item.item_characteristics
    }))

    console.log('Fetched user items:', items.value)
  } catch (err) {
    console.error('Error fetching user items:', err)
  }
}

// Call fetchUserItems on component mount
onMounted(() => {
  fetchUserItems()
})

// Function to add selected items to the service request
const addItemsToServiceRequest = async (selectedItems) => {
  console.log('addItemsToServiceRequest called with selectedItems:', selectedItems)

  try {
    const { data, error } = await supabase
      .from('service_customer_item_services')
      .insert(
        selectedItems.map(item => ({
          service_id: serviceId,
          service_customer_item_id: item.id,
          user_id: user_id.value
        }))
      )

    if (error) {
      console.error('Error adding items to service_customer_item_services:', error)
    } else {
      console.log('Items successfully added to service_customer_item_services:', data)
    }
  } catch (err) {
    console.error('Unexpected error in addItemsToServiceRequest:', err)
  }
}

// Function to handle the add-to-service-request event
const addToServiceRequest = async () => {
  console.log('addToServiceRequest called')
  await addItemsToServiceRequest(selectedItems.value)
  router.push(`/services/requests/edit/${serviceId}`)
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        title="Items Manager"
        class="ml-2"
      >
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter items..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>

      <div class="p-6">
        <AppServicesCustomerManagerItemsTable
          :items="items"
          :selected-items="selectedItems"
          @add-to-service-request="addToServiceRequest"
        />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>
