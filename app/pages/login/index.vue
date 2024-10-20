<template>
  <div>
    <UCard class="max-w-[480px]">
      <template #header>
        <h1 class="text-2xl font-bold">Sign in</h1>
      </template>
      <template #default>
        <form @submit.prevent="login">
          <!-- <ErrorAlert :error-msg="authError" @clearError="clearError" /> -->
          <div class="mt-4 flex flex-col space-y-6">
            <UFormGroup label="Email" size="xl" required>
              <UInput
                v-model="email"
                type="email"
                placeholder="Email"
                icon="i-heroicons-envelope"
              />
            </UFormGroup>

            <UFormGroup label="Password" size="xl" required>
              <UInput
                v-model="password"
                placeholder="password"
                icon="i-heroicons-envelope"
              />
            </UFormGroup>
          </div>
          <div class="">
            <UButton
              class="mt-5"
              color="primary"
              variant="solid"
              type="submit"
              block
              :loading="loading"
              loading-icon="i-heroicons-arrow-path-20-solid"
            >
              Sign in
            </UButton>
            <!-- <NuxtLink to="/forgot-password" class="">Forgot your password?</NuxtLink> -->
          </div>
        </form>
      </template>
      <template #footer>
        <div class="">
          <p class="text-sm dark:text-gray-500">
            Don’t have a SupaAuth account?
          </p>
          <NuxtLink to="/register">
            <button class="">
              <div class="text-sm dark:text-gray-400">Create new account</div>
            </button>
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "login",
});
useHead({
  title: "Login | supaAuth",
});
const user = useSupabaseUser();
const loading = ref(false);
const authError = ref("");
const email = ref("");
const password = ref("");
const client = useSupabaseClient();

watchEffect(async () => {
  if (user.value) {
    await navigateTo("/");
  }
});

const login = async () => {
  loading.value = true;
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    loading.value = false;
    authError.value = "Invalid login credentials";
    setTimeout(() => {
      authError.value = "";
    }, 5000);
  } else {
    // Navigate to a different page on successful login or handle success case
    loading.value = false;
  }
};

const clearError = () => {
  authError.value = "";
};
</script>
