export interface Customer {
  full_name: string
}
export interface ServiceWithRelations {
  id: string
  user_id: string
  service_date: string
  status_id: string
  service_type_id: string // Add this field for service type
  description: string | null
  customers: Customer
  flight: string | null
  flight_date_time: string | null
  servicestatuses: { status: string } // assuming this format for the service status relation
  servicetypes: { type_name: string } // assuming this format for the service type relation
}
