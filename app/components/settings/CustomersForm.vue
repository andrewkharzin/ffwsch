<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

const emit = defineEmits(['close'])

const user = reactive({
  email: '',
  role: 'member', // Default role
})

// Fetch the current user's data
async function fetchUser() {
  const supabase = useSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error.message)
    return
  }

  user.email = data?.user?.email || ''
  user.role = data?.user?.app_metadata?.role || 'member'
}

// Validate form inputs
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Please enter an email.' })
  return errors
}

// Submit form data
async function onSubmit(event: FormSubmitEvent<any>) {
  const supabase = useSupabaseClient()
  const { error } = await supabase.auth.updateUser({
    email: user.email,
    data: {
      role: user.role,
    },
  })

  if (error) {
    console.error('Error updating user:', error.message)
    return
  }

  console.log('User updated successfully')
  emit('close')
}

onMounted(fetchUser)
</script>

<template>
  <UForm
    :validate="validate"
    :validate-on="['submit']"
    :state="user"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormGroup label="Email" name="email">
      <UInput
        v-model="user.email"
        type="email"
        placeholder="john.doe@example.com"
        autofocus
      />
    </UFormGroup>

    <UFormGroup label="Role" name="role">
      <USelectMenu
        v-model="user.role"
        :options="['stuff', 'airline_agent', 'customer']"
        :ui-menu="{ select: 'capitalize', option: { base: 'capitalize' } }"
      />
    </UFormGroup>

    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" />
    </div>
  </UForm>
</template>
