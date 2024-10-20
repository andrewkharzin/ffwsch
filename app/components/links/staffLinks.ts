export const staffLinks = [
  {
    id: "home",
    label: "Home",
    icon: "i-heroicons-home",
    to: "/",
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
      {
        label: "Requests",
        to: "/services",
      },
    ],
  },
];
