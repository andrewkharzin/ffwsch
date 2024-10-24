import { defineStore } from 'pinia';

export const useServiceFilterStore = defineStore('serviceFilter', {
  state: () => ({
    selectedCompany: null,
  }),
  actions: {
    updateSelectedCompany(company) {
      this.selectedCompany = company?.company_name; // Store only the company name
      console.log('Store updated: selectedCompany', this.selectedCompany); // Log for debugging
    },
  },

});
