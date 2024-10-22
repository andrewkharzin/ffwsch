// hooks/useCrudService.ts
import { useCallback } from 'react'

export const useCrudService = () => {
  const supabase = useSupabaseClient()
  const insertService = useCallback(async (serviceData: any) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])

      if (error) {
        throw error
      }

      console.log('Service inserted:', data)
      return data
    } catch (error) {
      console.error('Error inserting service:', error)
      // Handle error accordingly
    }
  }, [])

  const updateService = useCallback(async (id: string, serviceData: any) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)

      if (error) {
        throw error
      }

      console.log('Service updated:', data)
      return data
    } catch (error) {
      console.error('Error updating service:', error)
      // Handle error accordingly
    }
  }, [])

  const deleteService = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      console.log('Service deleted:', data)
      return data
    } catch (error) {
      console.error('Error deleting service:', error)
      // Handle error accordingly
    }
  }, [])

  return {
    insertService,
    updateService,
    deleteService
  }
}
