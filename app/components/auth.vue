<script setup>
const supabase = useSupabaseClient()
const loading = ref(false)
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (error) throw error
    alert('Check your email for the login link!')
  } catch (error) {
    alert(error.error_description || error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <UAuthForm
      title="Login"
      description="Enter your credentials to access your account."
      align="bottom"
      icon="i-heroicons-user-circle"
      :fields="[
        {
          type: 'email',
          label: 'Email',
          name: 'email',
          placeholder: 'Enter your email',
          color: 'gray',
          vModel: email
        },
        {
          type: 'password',
          label: 'Password',
          name: 'password',
          placeholder: 'Enter your password',
          color: 'gray',
          vModel: password
        }
      ]"
      :loading="loading"
      :providers="[
        { label: 'GitHub', icon: 'i-simple-icons-github', color: 'gray' }
      ]"
    />
  </form>
</template>
