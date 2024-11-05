import { defineStore } from 'pinia'
import type { Database } from '~/types/database'

// Define types for service operations
type ServiceRow = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

export const useServiceStore = defineStore('serviceStore', {
  state: () => ({
    service: {
      id: null,
      service_type_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_time: '',
      description: '',
      status_id: null,
      user_id: '',
      customer_id: '',
      customer_flight: '',
      flight: '',
      flight_date_time: ''
    } as ServiceRow,
    flightOptions: [], // Массив для хранения опций рейсов
    isEditMode: false,
    isSending: false,
    statusIds: {
      draft: '138261c0-235e-4a19-9b1f-c4ef8afe8529',
      new: 'b3d9ebe7-f348-4fc2-924e-f61256bf13fc'
    },
    resetForm() {
      this.service.service_type_id = null
      this.service.description = ''
      this.service.status_id = null
      // Reset other fields to their default values...
    }
  }),

  actions: {
    async loadFlightOptions() {
      const supabase = useSupabaseClient()
      try {
        // Извлекаем данные из таблицы service_customer_flights
        const { data, error } = await supabase
          .from('service_customer_flights')
          .select('id, flight_number, flight_route')

        if (error) {
          console.error('Ошибка при загрузке списка рейсов:', error)
          return
        }

        // Форматируем данные для списка выбора
        this.flightOptions = data.map(flight => ({
          value: flight.id, // ID рейса (UUID)
          label: `${flight.flight_number} - ${flight.flight_route}` // Описание рейса
        }))
        console.log('Загружены опции рейсов:', this.flightOptions)
      } catch (error) {
        console.error('Ошибка при загрузке рейсов:', error)
      }
    },

    resetService() {
      this.service = {
        id: null,
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_time: '',
        description: '',
        status_id: this.statusIds.draft,
        user_id: '',
        customer_id: '',
        flight: '',
        flight_date_time: ''
      } as ServiceRow
      this.isEditMode = false
      console.log('Service reset with draft status:', this.service.status_id)
    },

    setEditMode(value: boolean) {
      this.isEditMode = value
      if (!value) {
        this.resetService() // Reset the service if exiting edit mode
      }
    },

    setService(data: ServiceRow) {
      this.service = { ...data }
      this.isEditMode = true
      this.service.status_id = this.statusIds.new // Update to new status when in edit mode
      console.log('Service set for editing with new status:', this.service.status_id)
    },

    async fetchServiceById(id: string): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error fetching service by ID:', error)
          return null
        }

        console.log('Fetched service data:', data)
        this.service = data as ServiceRow
        this.isEditMode = true
        return data
      } catch (error) {
        console.error('Error in fetchServiceById:', error)
        return null
      }
    },

    async submitService(): Promise<ServiceRow | null> {
      console.log('Current customer_flight value before submission:', this.service.customer_flight)
      console.log('Current flight value before submission:', this.service.flight)

      this.service.status_id = this.isEditMode ? this.statusIds.new : this.statusIds.draft
      console.log('Service object before submission:', this.service)

      if (!this.service.status_id) {
        console.error('Error: Missing valid status_id.')
        return null
      }

      this.isSending = true
      try {
        const response = this.isEditMode
          ? await this.updateService(this.service)
          : await this.insertService(this.service)

        if (!response) {
          console.error(this.isEditMode ? 'Update service failed.' : 'Insert service failed.')
          return null
        }

        console.log(this.isEditMode ? 'Service successfully updated:' : 'Service successfully created:', response)
        return response
      } catch (error) {
        console.error('Error saving service:', error)
        return null
      } finally {
        this.isSending = false
      }
    },
    async insertService(newService: ServiceInsert): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        const { data, error, status } = await supabase
          .from('services')
          .insert(newService)
          .select() // This will retrieve the inserted row
          .single() // Ensure you're expecting a single response

        console.log('Full Supabase response:', { data, error, status })

        if (error) {
          console.error('Error inserting service:', error.message)
          throw new Error(`Insert failed: ${error.message} (Status: ${status})`)
        }

        console.log('Insert service response:', data)
        return data as ServiceRow
      } catch (error) {
        console.error('Failed to insert service:', error)
        return null
      }
    },

    async updateService(updatedService: ServiceUpdate): Promise<ServiceRow | null> {
      const supabase = useSupabaseClient()
      try {
        console.log('Updating service with ID:', updatedService.id)
        console.log('Updating service with customer_flight:', updatedService.customer_flight)
        console.log('Updating service with flight:', updatedService.flight)

        const { data, error } = await supabase
          .from('services')
          .update({
            ...updatedService,
            customer_flight: updatedService.customer_flight,
            flight: updatedService.flight,
          })
          .eq('id', updatedService.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating service:', error.message)
          return null
        }

        this.service = data as ServiceRow
        console.log('Service successfully updated:', data)

        return data
      } catch (error) {
        console.error('Failed to update service:', error)
        return null
      }
    }

  },
  // Добавляем watcher для отслеживания изменений в поле flight
  getters: {
    watchFlight: (state) => {
      // Следим за изменениями в поле flight
      watch(
        () => state.service.flight,
        (newFlight) => {
          if (newFlight) {
            // Обновляем customer_flight, когда flight выбирается
            state.service.customer_flight = newFlight
            console.log('customer_flight updated:', state.service.customer_flight)
          }
        }
      )
    }
  }
})
