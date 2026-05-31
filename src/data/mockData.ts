export interface MenuItem {
  id: number;
  name: string;
  price: string;
  image: string;
  badge?: string;
  badgeDark?: boolean;
  staggered?: boolean;
}

export interface Stat {
  value: string;
  label: string;
}

export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export const featuredDishes: MenuItem[] = [
  {
    id: 1,
    name: 'Dragon Roll',
    price: '120,000 UZS',
    image:
      'https://lh3.googleusercontent.com/aida/ADBb0uijkyg1Z6KWD_N5aIBQGMc6RMorexpNshiJVdLqo6J92AVUa9NTxDTeYJej7fR5uQixi9qBajPd5-4OJVmT1EtW7mW6VQEr9SqsvzHk8QCJ3tvC2WEPpuGf8sLvulaPqw-9i_WtOlqN3gH3ZugEdGu1PC-h3DcsZU7ewCl12Ch-cxvJhImynzIGPxE9f7Md89IRoDQPlTYjKMXaoPEadKGQSGMPJfWnVMAqRb2Y0pvckJyuBX9TkqVkVuFL',
    badge: 'Popular',
    staggered: false,
  },
  {
    id: 2,
    name: 'Salmon Nigiri',
    price: '60,000 UZS',
    image:
      'https://lh3.googleusercontent.com/aida/ADBb0ug5v3l6jX6XmiHkS95ThSsVSzNWNufTWwYXJQ0LG3VAb3xOcZNUKfVCXiwz0SWRcpWMestTv_JYJiAiXRsJldVNS_rX4abb_OZqIAmCWC8nIlkmpub6Ie_KYkd-0U9km8H-JkIYtfoHzBDhiInqu9XnuHV7C0BJnIfn7G6TfASCkpRkxzscPfJTy47Or6JyBn8hXbMQt1GV7x4F_40u9Jn_9ykb6YeSx_rCfpXSo35_P20zGAQV2JAzDzCF',
    staggered: true,
  },
  {
    id: 3,
    name: 'Tonkotsu Ramen',
    price: '85,000 UZS',
    image:
      'https://lh3.googleusercontent.com/aida/ADBb0uiQnQ8vkdWjZc7uPGTUY7ukrUe6dhq47q0-QdfPmveIBejjw_fyartPYkRF11l5udtKMCxmx_1Y81r2TcxBiASRTVv1DiOjixH5-BHX8CzHKQBwRUKYR8ADpdaNH199EIewJGI6N5pBTqhGZm23VHd0AhS4O6H9rFsA3kBkABf-eGCLIC0ojmnBigDa0f3EMey7Q2L-zz17XHfqOKip2ujuK_EIxWRuGqZ1Yl8uD5busnJUHJGB_1dPYsw',
    badge: 'New',
    badgeDark: true,
    staggered: false,
  },
  {
    id: 4,
    name: 'Rainbow Roll',
    price: '110,000 UZS',
    image:
      'https://lh3.googleusercontent.com/aida/ADBb0ujjI5dibVius1-fdiLTzxsUusq7_lq987nGUnYw8axAg6BeI_Qs0AI9Q6cPjPMYz4czKS7hCdn-00NfUPF_CD9MRI5TaGn3wKWWL2upNLGndC5mdmeZoDZZWdwHhHRBou71Cf5B9kHgpVA9wvRzx9Yp8yDR9pJW5MZfRik735lNFUPhgca-2TGgB95rdNopAS5sandwFYY2-SrUV8XRGXzZ51lbQ6yMpdVDrVa6y6KXShoE0dlKa-Ks84wj',
    staggered: true,
  },
];

export const heroStats: Stat[] = [
  { value: '50+', label: 'Unique Rolls' },
  { value: '100%', label: 'Fresh Ingredients' },
  { value: '4.9', label: 'Customer Rating' },
];

export const aboutFeatures: AboutFeature[] = [
  { icon: 'restaurant_menu', title: 'Master Chefs', description: 'Trained in traditional Japanese culinary arts.' },
  { icon: 'set_meal', title: 'Fresh Catch', description: 'Premium ingredients sourced daily for quality.' },
  { icon: 'storefront', title: 'Atmosphere', description: 'Modern dining space with a cozy vibe.' },
  { icon: 'delivery_dining', title: 'Fast Delivery', description: 'Hot and fresh straight to your doorstep.' },
];

export const navLinks: NavLink[] = [
  { label: 'Menu', href: '/menu', active: true },
  { label: 'About', href: '#about' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Contact', href: '#contact' },
];

export const footerExplore: NavLink[] = [
  { label: 'Menu', href: '/menu', active: true },
  { label: 'About', href: '#about' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Contact', href: '#contact' },
];

export const footerInfo: NavLink[] = [
  { label: 'Visit Details', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'My Account', href: '/profile' },
];

export interface MenuPageItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  badge?: string;
  badgeVariant?: 'red' | 'frosted';
}

export const menuPageItems: MenuPageItem[] = [
  {
    id: 1,
    name: 'Dragon Roll',
    description: 'Premium eel, fresh avocado, cucumber, and unagi sauce.',
    price: '55,000 UZS',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0uijkyg1Z6KWD_N5aIBQGMc6RMorexpNshiJVdLqo6J92AVUa9NTxDTeYJej7fR5uQixi9qBajPd5-4OJVmT1EtW7mW6VQEr9SqsvzHk8QCJ3tvC2WEPpuGf8sLvulaPqw-9i_WtOlqN3gH3ZugEdGu1PC-h3DcsZU7ewCl12Ch-cxvJhImynzIGPxE9f7Md89IRoDQPlTYjKMXaoPEadKGQSGMPJfWnVMAqRb2Y0pvckJyuBX9TkqVkVuFL',
    badge: "Chef's Choice",
    badgeVariant: 'red',
  },
  {
    id: 2,
    name: 'Salmon Nigiri',
    description: 'Hand-pressed premium vinegared rice with fresh Atlantic salmon.',
    price: '42,000 UZS',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ug5v3l6jX6XmiHkS95ThSsVSzNWNufTWwYXJQ0LG3VAb3xOcZNUKfVCXiwz0SWRcpWMestTv_JYJiAiXRsJldVNS_rX4abb_OZqIAmCWC8nIlkmpub6Ie_KYkd-0U9km8H-JkIYtfoHzBDhiInqu9XnuHV7C0BJnIfn7G6TfASCkpRkxzscPfJTy47Or6JyBn8hXbMQt1GV7x4F_40u9Jn_9ykb6YeSx_rCfpXSo35_P20zGAQV2JAzDzCF',
  },
  {
    id: 3,
    name: 'Tonkotsu Ramen',
    description: '12-hour simmered pork broth, chashu pork, and soft egg.',
    price: '65,000 UZS',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0uiQnQ8vkdWjZc7uPGTUY7ukrUe6dhq47q0-QdfPmveIBejjw_fyartPYkRF11l5udtKMCxmx_1Y81r2TcxBiASRTVv1DiOjixH5-BHX8CzHKQBwRUKYR8ADpdaNH199EIewJGI6N5pBTqhGZm23VHd0AhS4O6H9rFsA3kBkABf-eGCLIC0ojmnBigDa0f3EMey7Q2L-zz17XHfqOKip2ujuK_EIxWRuGqZ1Yl8uD5busnJUHJGB_1dPYsw',
    badge: 'Signature',
    badgeVariant: 'frosted',
  },
  {
    id: 4,
    name: 'Rainbow Roll',
    description: 'California roll topped with assorted fresh fish and avocado.',
    price: '58,000 UZS',
    image: 'https://lh3.googleusercontent.com/aida/ADBb0ujjI5dibVius1-fdiLTzxsUusq7_lq987nGUnYw8axAg6BeI_Qs0AI9Q6cPjPMYz4czKS7hCdn-00NfUPF_CD9MRI5TaGn3wKWWL2upNLGndC5mdmeZoDZZWdwHhHRBou71Cf5B9kHgpVA9wvRzx9Yp8yDR9pJW5MZfRik735lNFUPhgca-2TGgB95rdNopAS5sandwFYY2-SrUV8XRGXzZ51lbQ6yMpdVDrVa6y6KXShoE0dlKa-Ks84wj',
  },
];
