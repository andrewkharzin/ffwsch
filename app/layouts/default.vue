<script setup lang="ts">
// Import role-based link configurations
import { customerLinks } from "../components/links/customersLinks";
import { managerLinks } from "../components/links/managersLinks";
import { staffLinks } from "../components/links/staffLinks";
import { accounterLinks } from "../components/links/accountersLinks";

const route = useRoute();
const appConfig = useAppConfig();
const { isHelpSlideoverOpen } = useDashboard();

const { user } = useSupabaseUserrito(); // Call your composable here
const supabase = useSupabaseClient();
// Define all links
const allLinks = [
  {
    id: "home",
    label: "Home",
    icon: "i-heroicons-home",
    to: "/",
    tooltip: {
      text: "Home",
      shortcuts: ["G", "H"],
    },
  },
  {
    id: "services",
    label: "Services",
    icon: "i-heroicons-briefcase",
    to: "/services",
    children: [
      {
        label: "Orders",
        to: "/services/orders",
      },
      // {
      //   label: "Accounting",
      //   to: "/services/accounting",
      // },
      {
        label: "Requests",
        to: "/services",
      },
      // {
      //   label: "Types",
      //   to: "/services/types",
      // },
      {
        label: "Customers",
        to: "/services/customers",
      },
    ],
    tooltip: {
      text: "Services",
      shortcuts: ["G", "R"],
    },
  },
];

// const customerLinks = [
//   {
//     id: "home",
//     label: "Home",
//     icon: "i-heroicons-home",
//     to: "/",
//     tooltip: {
//       text: "Home",
//       shortcuts: ["G", "H"],
//     },
//   },
// ];

// Define footer links
const footerLinks = [
  {
    label: "Invite people",
    icon: "i-heroicons-plus",
    to: "/settings/members",
  },
  {
    label: "Help & Support",
    icon: "i-heroicons-question-mark-circle",
    click: () => (isHelpSlideoverOpen.value = true),
  },
];

// const filteredLinks = computed(() => {
//   // Log the user object for debugging
//   console.log("User raw", user.value);

//   // Access the user's role from app_metadata
//   const userRole = user.value?.app_metadata?.role;

//   // Debugging to see the role extracted
//   console.log("User Role:", userRole);

//   // Check the user's role and filter links accordingly
//   if (userRole === "customer") {
//     return []; // Hide links for 'customer' role
//   } else if (userRole === "staff") {
//     return allLinks; // Show all links for 'staff' role
//   }

//   // If role is neither customer nor staff, you might want to return an empty array or some default links
//   return []; // Adjust as needed for other roles
// });

// Filter links based on user role
const filteredLinks = computed(() => {
  console.log("User raw", user.value);

  const userRole = user.value?.app_metadata?.role;
  console.log("User Role:", userRole);

  switch (userRole) {
    case "customer":
      return customerLinks;
    case "staff":
      return staffLinks;
    case "manager":
      return managerLinks;
    case "accounter":
      return accounterLinks;
    default:
      return []; // If the role doesn't match any, return an empty array or default links
  }
});

// Define other dashboard groups like "code" commands
const groups = [
  {
    key: "links",
    label: "Go to",
    commands: filteredLinks.value.map((link) => ({
      ...link,
      shortcuts: link.tooltip?.shortcuts,
    })),
  },
  {
    key: "code",
    label: "Code",
    commands: [
      {
        id: "source",
        label: "View page source",
        icon: "i-simple-icons-github",
        click: () => {
          window.open(
            `https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${
              route.path === "/" ? "/index" : route.path
            }.vue`,
            "_blank"
          );
        },
      },
    ],
  },
];

// Customize primary color options
const defaultColors = ref(
  ["green", "teal", "cyan", "sky", "blue", "indigo", "violet"].map((color) => ({
    label: color,
    chip: color,
    click: () => (appConfig.ui.primary = color),
  }))
);
const colors = computed(() =>
  defaultColors.value.map((color) => ({
    ...color,
    active: appConfig.ui.primary === color.label,
  }))
);
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="250"
      :resizable="{ min: 200, max: 300 }"
      collapsible
    >
      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">
        <template #left>
          <TeamsDropdown />
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <!-- Render filtered links based on user role -->
        <UDashboardSidebarLinks :links="filteredLinks" />

        <UDivider />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <!-- ~/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
</template>