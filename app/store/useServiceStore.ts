import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useServiceStore = defineStore(
  'service',
  () => {
    const supabase = useSupabaseClient()

    // States to hold data
    const services = ref([])
    const serviceTypes = ref([])
    const serviceStatuses = ref([])
    const customers = ref([])
    const serviceData = ref({
      service_type_id: '',
      status_id: '',
      customer_id: '',
      service_date: '',
      description: ''
    })
    const isEditing = ref(false)
    const editingId = ref<string | null>(null)

    // Function to load all data
    async function loadAllData() {
      try {
        await Promise.all([fetchRelatedData(), fetchAllServices()])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    // Function to fetch related data
    async function fetchRelatedData() {
      try {
        const [typesResponse, statusesResponse, customersResponse] = await Promise.all([
          supabase.from('servicetype').select('id, type_name'),
          supabase.from('servicestatuses').select('id, status'),
          supabase.from('customers').select('id, full_name')
        ])

        // Handle response data
        serviceTypes.value = typesResponse.data || []
        serviceStatuses.value = statusesResponse.data || []
        customers.value = customersResponse.data || []

        console.log('Service Types:', serviceTypes.value)
        console.log('Service Statuses:', serviceStatuses.value)
        console.log('Customers:', customers.value)
      } catch (error) {
        console.error('Error fetching related data:', error)
      }
    }

    // Function to fetch all services
    async function fetchAllServices() {
      try {
        const { data, error } = await supabase.from('services').select('*')
        if (error) throw new Error(error.message)
        services.value = data || []
        console.log('Services loaded:', services.value)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    // CRUD operation handlers
    async function handleInsertService() {
      try {
        const { error } = await supabase.from('services').insert([serviceData.value])
        if (error) throw new Error(error.message)
        resetForm()
        await fetchAllServices()
      } catch (error) {
        console.error('Error inserting service:', error)
      }
    }

    async function handleUpdateService() {
      if (editingId.value) {
        try {
          const { error } = await supabase.from('services').update(serviceData.value).match({ id: editingId.value })
          if (error) throw new Error(error.message)
          resetForm()
          await fetchAllServices()
        } catch (error) {
          console.error('Error updating service:', error)
        }
      }
    }

    async function handleDeleteService(id: string) {
      try {
        const { error } = await supabase.from('services').delete().match({ id })
        if (error) throw new Error(error.message)
        await fetchAllServices()
      } catch (error) {
        console.error('Error deleting service:', error)
      }
    }

    function editService(srv: any) {
      isEditing.value = true
      editingId.value = srv.id
      serviceData.value = { ...srv }
    }

    function cancelEdit() {
      resetForm()
    }

    function resetForm() {
      serviceData.value = {
        service_type_id: '',
        status_id: '',
        customer_id: '',
        service_date: '',
        description: ''
      }
      isEditing.value = false
      editingId.value = null
    }

    // Debug: Watch for data changes
    watchEffect(() => {
      console.log('Current services:', services.value)
      console.log('Current serviceTypes:', serviceTypes.value)
      console.log('Current serviceStatuses:', serviceStatuses.value)
      console.log('Current customers:', customers.value)
    })

    return {
      services,
      serviceData,
      serviceTypes,
      serviceStatuses,
      customers,
      isEditing,
      loadAllData,
      handleInsertService,
      handleUpdateService,
      handleDeleteService,
      editService,
      cancelEdit
    }
  },
  {
    persist: true // Enable persistence
  }
)
