<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { FormError, FormSubmitEvent } from "#ui/types";

const fileRef = ref<HTMLInputElement>();
const isDeleteAccountModalOpen = ref(false);
const toast = useToast();

// Get the current authenticated user
const user = useSupabaseUser();

// Use the profile composable
const { profile, fetchProfile, updateProfile, loading } = useProfile();

// Fetch the user's profile when the component is mounted
onMounted(() => {
  if (user.value) {
    fetchProfile(user.value.id);
  }
});

function validate(state: any): FormError[] {
  const errors = [];
  if (!state.full_name)
    errors.push({ path: "full_name", message: "Please enter your full name." });
  if (!state.username)
    errors.push({ path: "username", message: "Please enter your username." });
  return errors;
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  profile.value.avatar_url = URL.createObjectURL(input.files[0]);
}

function onFileClick() {
  fileRef.value?.click();
}

async function onSubmit(event: FormSubmitEvent<any>) {
  if (!profile.value) return;

  const { error } = await updateProfile({
    ...profile.value,
    full_name: profile.value.full_name,
    username: profile.value.username,
    bio: profile.value.bio,
    avatar_url: profile.value.avatar_url,
  });

  if (error) {
    toast.add({
      title: "Error updating profile",
      icon: "i-heroicons-exclamation-circle",
    });
  } else {
    toast.add({ title: "Profile updated", icon: "i-heroicons-check-circle" });
  }
}
</script>

<template>
  <UDashboardPanelContent class="pb-24" v-if="profile && !loading">
    <UForm :state="profile" :validate="validate" @submit="onSubmit">
      <UDashboardSection
        title="Profile"
        description="This information will be displayed publicly."
      >
        <template #links>
          <UButton type="submit" label="Save changes" color="black" />
        </template>

        <UFormGroup
          name="full_name"
          label="Full Name"
          required
          class="grid grid-cols-2 gap-2 items-center"
        >
          <UInput
            v-model="profile.full_name"
            autocomplete="off"
            icon="i-heroicons-user"
            size="md"
          />
        </UFormGroup>

        <UFormGroup
          name="email"
          label="Email"
          description="Email cannot be changed."
          class="grid grid-cols-2 gap-2"
        >
          <UInput v-model="user.email" type="email" disabled size="md" />
        </UFormGroup>

        <UFormGroup
          name="username"
          label="Username"
          description="Your unique username."
          required
          class="grid grid-cols-2 gap-2"
        >
          <UInput v-model="profile.username" size="md" />
        </UFormGroup>

        <UFormGroup
          name="avatar"
          label="Avatar"
          class="grid grid-cols-2 gap-2"
          help="JPG, GIF or PNG. 1MB Max."
        >
          <UAvatar
            :src="profile.avatar_url"
            :alt="profile.full_name"
            size="lg"
          />

          <UButton
            label="Choose"
            color="white"
            size="md"
            @click="onFileClick"
          />

          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          />
        </UFormGroup>

        <UFormGroup
          name="bio"
          label="Bio"
          description="A short description of yourself."
          class="grid grid-cols-2 gap-2"
        >
          <UTextarea v-model="profile.bio" :rows="5" autoresize size="md" />
        </UFormGroup>
      </UDashboardSection>
    </UForm>

    <UDashboardSection title="Account" description="Manage your account.">
      <UButton
        color="red"
        label="Delete account"
        size="md"
        @click="isDeleteAccountModalOpen = true"
      />
    </UDashboardSection>

    <SettingsDeleteAccountModal v-model="isDeleteAccountModalOpen" />
  </UDashboardPanelContent>

  <UDashboardPanelContent v-if="loading">
    <ULoadingSpinner />
  </UDashboardPanelContent>
</template>
