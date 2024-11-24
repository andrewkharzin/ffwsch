export const staffLinks = [
  {
    id: 'home',
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'i-eos-icons:service-plan-outlined',
    to: '/services',
    children: [
      {
        label: 'Orders',
        to: '/services/orders'
      },
      {
        label: 'Requests',
        to: '/services'
      },
      {
        label: 'Test New Req',
        to: '/services/requests/new'
      }
    ]
  },
  // {
  //   id: 'customers',
  //   label: 'Customers',
  //   icon: 'i-ix:customer',
  //   to: '/customers',
  //   children: [
  //     {
  //       label: 'List',
  //       to: '/services/customers'
  //     }
  //     // {
  //     //   label: 'Settings',
  //     //   to: '/services/settings'
  //     // }
  //   ]
  // },
  {
    id: 'telexes',
    label: 'Telexes',
    icon: 'i-heroicons-briefcase',
    to: '/telexes',
    children: [
      {
        label: 'List',
        to: '/ffm'
      }
    ]
  },
  {
    id: 'booking',
    label: 'QBuk',
    icon: 'i-heroicons-briefcase',
    to: '/Bookings/stock',
    children: [
      {
        label: 'Bookings',
        icon: 'i-carbon:show-data-cards',
        to: '/services/bookings/list'
      },
      {
        label: 'My Data Stock',
        icon: 'i-material-symbols-light:folder-data-outline-rounded',
        to: '/services/bookings/datastock'
      }
    ]
  }
]
