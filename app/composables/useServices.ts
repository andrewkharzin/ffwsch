import { ref, onMounted, onUnmounted } from 'vue'
import type { Database } from '@/types/supabase' // Import Supabase types

type Service = Database['public']['Tables']['services']['Row']

interface ServiceType {
  type_name: string
}

interface Customer {
  full_name: string
  company_name?: string
  logo?: string
  id?: string // Add optional company_id
}

interface ServiceStatus {
  status: string
}

interface OrderNumber {
  serial_number: string
}

interface ServiceCompany {
  company_id: string
}

type ServiceWithRelations = Service & {
  servicetype?: ServiceType
  customers?: Customer
  servicestatuses?: ServiceStatus
  service_orders?: OrderNumber
  customer_company?: ServiceCompany
}

export const useServices = () => {
  const supabase = useSupabaseClient()
  const services = ref<ServiceWithRelations[]>([])
  const loading = ref<boolean>(true)
  const error = ref<string | null>(null)
  let channel: any = null

  const fetchServices = async (): Promise<void> => {
    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('services')
        .select(`
          id,
          service_type_id,
          customer_id,
          service_date,
          service_time,
          created_at,
          status_id,
          description,
          servicetype (type_name),
          customers (full_name, number_id, department, position, email, company_id, company_id:customer_company(id, company_name, logo)),
          servicestatuses (status),
          service_orders (service_id, serial_number),
          service_equipment (service_id, type, number, date_in, date_out, time_in, time_out, descriptions)
        `)

      console.log('Fetch full data', data)
      if (fetchError) {
        console.error('Error fetching services:', fetchError)
      } else {
        services.value = (data as ServiceWithRelations[]).map(service => ({
          ...service,
          type_name: service.servicetype?.type_name || 'N/A',
          full_name: service.customers?.full_name || 'N/A',
          status: service.servicestatuses?.status || 'N/A',
          serial_number: service.service_orders?.serial_number || 'N/A'
        }))
      }
    } catch (fetchError) {
      error.value = fetchError.message
      console.error('Error fetching services:', fetchError)
    } finally {
      loading.value = false
    }
  }

  const subscribeToRealtime = () => {
    channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          console.log('Change received!', payload)
          const { eventType, new: newService, old: deletedService } = payload

          if (eventType === 'INSERT') {
            // Здесь вам нужно извлечь связанные данные для newService
            enrichServiceData(newService).then((enrichedService) => {
              services.value.push(enrichedService)
              console.log('New service added:', enrichedService)
            })
          } else if (eventType === 'UPDATE') {
            const index = services.value.findIndex(service => service.id === newService.id)
            if (index !== -1) {
              enrichServiceData(newService).then((enrichedService) => {
                services.value[index] = enrichedService
                console.log('Service updated:', enrichedService)
              })
            }
          } else if (eventType === 'DELETE') {
            services.value = services.value.filter(service => service.id !== deletedService.id)
            console.log('Service deleted:', deletedService)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription to services table started')
        }
      })
  }

  const enrichServiceData = async (service: Service): Promise<ServiceWithRelations> => {
    // Извлекаем данные из связанных таблиц на основе идентификаторов
    const { data: customerData } = await supabase
      .from('customers')
      .select(`
         id,
         full_name,
         number_id,
         department,
         position,
         email,
         company_id,
         company_id:customer_company(id, company_name, logo)`)
      .eq('id', service.customer_id)
      .single()

    const { data: serviceTypeData } = await supabase
      .from('servicetype')
      .select('type_name')
      .eq('id', service.service_type_id)
      .single()

    const { data: statusData } = await supabase
      .from('servicestatuses')
      .select('status')
      .eq('id', service.status_id)
      .single()

    const { data: orderData, error } = await supabase
      .from('service_orders')
      .select('serial_number')
      .eq('service_id', service.id)
      .limit(1)

    if (error) {
      console.error('Ошибка запроса данных по заказам:', error)
    } else {
      console.log('Данные по заказам:', orderData)
    }

    return {
      ...service,
      servicetype: serviceTypeData,
      customers: customerData,
      servicestatuses: statusData,
      service_orders: orderData
    }
  }

  const unsubscribeFromRealtime = () => {
    if (channel) supabase.removeChannel(channel)
    console.log('Unsubscribed from services realtime channel')
  }

  onMounted(() => {
    fetchServices()
    subscribeToRealtime()
  })

  onUnmounted(() => {
    unsubscribeFromRealtime()
  })

  return {
    services,
    loading,
    error
  }
}
