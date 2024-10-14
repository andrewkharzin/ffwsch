<template>
  <div class="customer-card p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
    <div class="flex items-center gap-4">
      <!-- Company Logo -->
      <!-- <UAvatar :src="customer.company_id?.logo" size="lg" /> -->

      <div class="flex flex-col">
        <!-- Customer Full Name -->
        <h3 class="text-md font-bold">
          {{ customer.full_name }}
        </h3>

        <!-- Position and Company -->
        <div class="mt-2 flex flex-col">
          <p class="text-gray-400 text-sm">
            {{ customer.position }}
          </p>
          <span class="text-gray-400 text-sm">{{
            customer.company_id?.company_name || "N/A"
          }}</span>
        </div>

        <!-- Contact Details -->
        <div class="mt-2 flex flex-col">
          <p class="text-xs">Email: {{ customer.email || "N/A" }}</p>
          <span class="mt-2 text-xs">Phone: {{ customer.phone || "N/A" }}</span>
        </div>
      </div>
    </div>

    <!-- Customer Address -->
    <p class="mt-2 text-xs text-gray-600">
      {{ customer.address || "No address provided" }}
    </p>

    <!-- Customer Number ID -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col">
        <p class="mt-2 text-[0.6rem]">Customer ID:</p>
        <span class="mt-2 text-xs dark:text-teal-600">
          #{{ customer.number_id || "N/A" }}
        </span>
      </div>
      <div class="mt-4 flex flex-row-reverse">
        <UAvatar :src="customer.company_id?.logo" size="sm" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  customer: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.customer-card {
  transition: box-shadow 0.2s ease-in-out;
}

.customer-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
