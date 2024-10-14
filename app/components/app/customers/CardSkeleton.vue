<template>
  <div class="customer-card p-4 shadow-md rounded-lg">
    <div class="flex items-center gap-4">
      <div class="flex flex-col">
        <!-- Placeholder for customer full name -->
        <USkeleton class="h-4 w-40" />

        <!-- Placeholder for position and company -->
        <div class="mt-2 flex flex-col">
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-4 w-28 mt-2" />
        </div>

        <!-- Placeholder for contact details -->
        <div class="mt-2 flex flex-col">
          <USkeleton class="h-3 w-40" />
          <USkeleton class="h-3 w-36 mt-2" />
        </div>
      </div>
    </div>

    <!-- Placeholder for address -->
    <USkeleton class="h-3 w-full mt-2" />

    <!-- Placeholder for customer number ID and logo -->
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div class="flex flex-col">
        <USkeleton class="h-3 w-24" />
        <USkeleton class="h-3 w-12 mt-2" />
      </div>
      <div class="mt-4 flex flex-row-reverse">
        <USkeleton class="h-12 w-12 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup>
// No need for props when using skeleton, as it is a placeholder
</script>

<style scoped>
.customer-card {
  transition: box-shadow 0.2s ease-in-out;
}

.customer-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
