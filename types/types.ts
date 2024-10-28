export interface Customer {
  full_name: string
}

export interface ServiceWithRelations {
  id: string
  user_id: string
  service_date: string // or Date, depending on your data structure
  status_id: string
  description: string | null
  customers: Customer // assuming a one-to-one relationship
}
