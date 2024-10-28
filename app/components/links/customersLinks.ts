export const customerLinks = [
  {
    id: 'home',
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/',
    tooltip: {
      text: 'Home',
      shortcuts: ['G', 'H']
    }
  },
  {
    label: 'My Orders',
    icon: 'i-heroicons-shopping-cart',
    to: '/services/customers/requests/list'
  },
  {
    label: 'Test New Req',
    to: '/services/requests/new'
  }
]
