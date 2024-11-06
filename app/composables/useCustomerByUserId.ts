import { ref } from 'vue'

export const useCustomerByUserId = () => {
  const customer = ref(null)
  const error = ref(null)
  const loading = ref(false)
  const supabase = useSupabaseClient()
  const user = useSupabaseUser() // Get the current user

  // Function to fetch the customer based on the user_id
  const fetchCustomerByUserId = async () => {
    if (!user.value) {
      error.value = 'User not logged in'
      return null
    }

    loading.value = true
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.value.id)
        .single() // Fetch only one customer

      if (fetchError) {
        error.value = fetchError.message
        return null
      }

      customer.value = data // Set the fetched customer
      error.value = null // Clear any previous error
      return data // Return the customer data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    customer,
    error,
    loading,
    fetchCustomerByUserId
  }
}
