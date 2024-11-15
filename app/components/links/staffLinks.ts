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
    icon: 'i-heroicons-briefcase',
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
  {
    id: 'customers',
    label: 'Customers',
    icon: 'i-heroicons-briefcase',
    to: '/customers',
    children: [
      {
        label: 'List',
        to: '/services/customers'
      },
      {
        label: 'Settings',
        to: '/services/settings'
      }
    ]
  },
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
  }
]
