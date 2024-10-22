<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Requests" class="ml-4">
        <!-- Input for filtering users -->
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filter requests..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar class="ml-4 py-0 px-1.5 overflow-x-auto">
        <UHorizontalNavigation :links="links" />
      </UDashboardToolbar>
      <div class="p-4 ml-4">
        <AppServicesFormsNewRequest @serviceCreated="handleServiceCreated" />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
// Router instance to redirect after the service is created
const router = useRouter();

const handleServiceCreated = (newServiceId: string) => {
  // Handle the successful creation of the service, like navigating to a success page or showing a success message
  alert(`Service created with ID: ${newServiceId}`);
  // Optionally navigate to a different page
  router.push(`/services/${newServiceId}`);
};

const links = [
  [
    {
      label: "home",
      icon: "i-heroicons-home",
      component: "NuxtLink",
      to: `/`,
    },
    {
      label: "Requests",
      icon: "i-heroicons-queue-list",
      component: "NuxtLink",
      to: `/services/requests/list`,
    },
  ],
  [
    {
      label: "Documentation",
      icon: "i-heroicons-book-open",
      to: "https://ui.nuxt.com/pro",
      target: "_blank",
    },
  ],
];
</script>

<style scoped>
</style>
