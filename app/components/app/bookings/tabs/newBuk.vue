<template>
  <AppBookingsFormsBookingForm
    v-model="awbNumber"
    :bookTypes="bookTypes"
    :shippers="shippers"
    :consignees="consignees"
    :statuses="statuses"
    :isSubmitting="isSubmitting"
    :newBooking="newBooking"
    @createBooking="handleCreateBooking"
    @openAWBModal="openAWBModal"
  />
</template>

<script setup>
</script>
