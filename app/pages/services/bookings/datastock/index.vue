<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="DataStock" />

      <UDashboardPanelContent>
        <ULandingGrid>
          <ULandingCard
            class="col-span-6 row-span-2"
            icon="i-fluent:data-usage-toolbox-20-filled"
            title="FFM Data"
            description="Manage your manifests from draft to approved"
          >
            <div class="wrapper">
              <UCard>
                <UHeaderLinks
                  :links="links"
                  class="nav-box"
                />
              </UCard>
            </div>
          </ULandingCard>
          <ULandingCard
            class="col-span-6 row-span-4"
            icon="i-heroicons-wrench-screwdriver"
            title="Fully Customizable"
            description="Change the style of any component in your App Config or with ui prop."
          />
          <ULandingCard
            class="col-span-6 row-span-4"
            icon="i-material-symbols:stockpot-sharp"
            title="Data Stocks"
            description="Manage your shipments data"
          >
            <div class="">
              <NuxtLink to="/services/bookings/datastock/stock">

                <UButton
                  variant="solid"
                  color="teal"
                  >
                  Enter
                </UButton>
              </NuxtLink>
            </div>
          </ULandingCard>
          <ULandingCard
            class="col-span-6 row-span-2"
            icon="i-heroicons-computer-desktop"
            title="Keyboard Shortcuts"
            description="Nuxt UI comes with a set of Vue composables to easily handle shortcuts."
          />
        </ULandingGrid>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup>
const links = [{
  label: 'AWBook',
  icon: 'i-heroicons-book-open',
  to: '/awbbook'
}, {
  label: 'Flights',
  icon: 'i-heroicons-rocket-launch',
  to: '/flights'
}]
</script>

<style scope>

</style>
