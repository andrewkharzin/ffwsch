<script setup lang="ts">
import type { PropType } from 'vue'

// Define a type for members
interface Member {
  name: string
  username: string
  email?: string
  phone?: string
  role: string
  avatar?: { src: string }
  company?: {
    logo?: string
    name?: string
  }
  id?: string
}

// Props for members
defineProps({
  members: {
    type: Array as PropType<Member[]>,
    default: () => []
  }
})

function getItems(member: Member) {
  return [
    [
      {
        label: 'Edit Member',
        click: () => console.log('Edit', member),
      },
      {
        label: 'Remove Member',
        labelClass: 'text-red-500 dark:text-red-400',
        click: () => console.log('Remove', member),
      },
    ],
  ]
}

function onRoleChange(member: Member, role: string) {
  console.log(`${member.username}'s role changed to ${role}`)
}
</script>

<template>
  <ul
    role="list"
    class="divide-y divide-gray-200 dark:divide-gray-800"
  >
    <li
      v-for="(member, index) in members"
      :key="index"
      class="flex flex-col gap-4 py-4 px-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div class="flex items-start gap-4">
        <!-- Member Avatar -->
        <!-- <UAvatar v-bind="member.company_id?.logo" size="lg" /> -->
        <UAvatar :src="member.avatar.src"
         size="lg"
         />

        <div class="flex flex-col">
          <!-- Username -->
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ member.full_name }}
          </p>

          <!-- Contact Information -->
          <p class="text-sm mt-2 text-gray-400">
            Email: {{ member.email || 'N/A' }}
          </p>
          <p class="text-sm text-gray-400">
            Phone: {{ member.phone || 'N/A' }}
          </p>
           <!-- Role -->
           <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Role: {{ member.role || 'N/A' }}
            </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Role Selector -->
        <!-- <USelectMenu
          :model-value="member.role"
          :options="['member', 'owner', 'admin']"
          color="white"
          :ui-menu="{ select: 'capitalize', option: { base: 'capitalize' } }"
          @update:model-value="onRoleChange(member, $event)"
        /> -->

        <!-- Action Dropdown -->
        <UDropdown
          :items="getItems(member)"
          position="bottom-end"
        >
          <UButton
            icon="i-heroicons-ellipsis-vertical"
            color="gray"
            variant="ghost"
          />
        </UDropdown>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul {
  max-width: 100%;
}
</style>
