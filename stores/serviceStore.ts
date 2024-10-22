import { defineStore } from 'pinia'

export const useServiceStore = defineStore('serviceStore', {
  state: () => ({
    service: {
      id: null,
      service_type_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_time: '',
      description: '',
      status_id: 'Draft', // Default status for new entries
      user_id: ''
    },
    isEditMode: false
  }),
  actions: {
    resetService() {
      this.service = {
        id: null,
        service_type_id: '',
        service_date: new Date().toISOString().split('T')[0],
        service_time: '',
        description: '',
        status_id: 'Draft',
        user_id: ''
      }
      this.isEditMode = false
    },
    setService(data) {
      this.service = { ...data }
      this.isEditMode = true
      this.service.status_id = 'New' // Set status to New when editing
    },
    submitService() {
      if (this.isEditMode) {
        this.service.status_id = 'New' // Change status to New
      }
      // Here you would call your API to save the service
      // return api.saveService(this.service)
      return this.service // For demonstration purposes
    }
  }
})
