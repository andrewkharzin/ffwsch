import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Database } from '../../types/supabase'
import { useCrudService } from './../composables/useCrudService'
import { useCustomerByUserId } from './../composables/useCustomerByUserId'

// Define types for rows and inserts in the services table
type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']

export const useServiceStore = defineStore('serviceStore', () => {
  // State definitions
  const service = ref<ServiceRow>({
    service_type_id: '',
    service_date: new Date().toISOString().split('T')[0],
    service_time: '',
    description: '',
    status_id: null,
    user_id: '',
    customer_id: ''
  })

  const isEditMode = ref(false)

  const statusIds = {
    draft: '138261c0-235e-4a19-9b1f-c4ef8afe8529',
    new: 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc'
  }

  // Reset the service to default values
  const resetService = () => {
    service.value = {
      service_type_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_time: '',
      description: '',
      status_id: statusIds.draft, // Default to draft status
      user_id: '',
      customer_id: ''
    }
    isEditMode.value = false
    console.log('Service reset with draft status:', service.value.status_id)
  }
  console.log("Reset service ", resetService)

  // Set the service for editing
  const setService = (data: ServiceRow) => {
    service.value = { ...data }
    isEditMode.value = true
    service.value.status_id = statusIds.new
    console.log('Service set for editing with new status:', service.value.status_id)
  }

  // Submit the service data
  const submitService = async (): Promise<ServiceRow | null> => {
    const user = useSupabaseUser() // Get current user
    const { fetchCustomerByUserId } = useCustomerByUserId() // Get customer by user ID

    if (!user.value) {
      console.error('User not logged in.')
      return null
    }

    service.value.user_id = user.value.id
    console.log("Store Service objext ", service)

    const customerData = await fetchCustomerByUserId()
    if (customerData) {
      service.value.customer_id = customerData.id
    } else {
      console.error('Could not fetch customer data.')
      return null
    }

    console.log('Service data before setting status:', service.value)

    // Set the status based on edit mode
    service.value.status_id = isEditMode.value ? statusIds.new : statusIds.draft

    console.log('Service data before submission:', service.value)

    if (!service.value.status_id) {
      console.error('Error: Missing valid status_id.')
      return null
    }

    try {
      const response = await insertService(service.value as ServiceInsert)
      return response
    } catch (error) {
      console.error('Error saving service:', error)
      return null
    }
  }

  // Insert a new service into Supabase
  const insertService = async (newService: ServiceInsert): Promise<ServiceRow | null> => {
    try {
      const { data, error } = await useCrudService().insertService(newService)

      if (error) {
        console.error('Error inserting service:', error)
        throw new Error('Failed to insert service')
      }

      return data as ServiceRow
    } catch (error) {
      console.error('Failed to insert service:', error)
      return null
    }
  }

  return {
    service,
    isEditMode,
    statusIds,
    resetService,
    setService,
    submitService
  }
})
