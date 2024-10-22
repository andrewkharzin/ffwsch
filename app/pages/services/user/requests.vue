<!-- /services/user/requests.vue -->
<template>
  <div>
    <AppServicesOrdersUserSeviceTable
      :services="services"
      :loading="loading"
      :error="error"
      :userId="userId"
    />
  </div>
</template>

<script setup lang="ts">
</script>