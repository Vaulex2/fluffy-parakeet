export interface MenuItem {
  id: number;
  name: string;
  price: string;
  image: string;
  description?: string;
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

export interface AboutMilestone {
  year: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
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
      'https://images.unsplash.com/photo-1713453018516-b08018818c0c?auto=format&fit=crop&w=800&q=80',
    description: 'Premium eel, ripe avocado & cucumber under a glossy unagi glaze.',
    badge: 'Popular',
    staggered: false,
  },
  {
    id: 2,
    name: 'Salmon Nigiri',
    price: '60,000 UZS',
    image:
      'https://images.unsplash.com/photo-1657895116421-c1c9596d8dd2?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-pressed vinegared rice crowned with fresh Atlantic salmon.',
    staggered: true,
  },
  {
    id: 3,
    name: 'Tonkotsu Ramen',
    price: '85,000 UZS',
    image:
      'https://images.unsplash.com/photo-1635379511574-bc167ca085c8?auto=format&fit=crop&w=800&q=80',
    description: '12-hour pork broth, melt-in-mouth chashu & a jammy soft egg.',
    badge: 'New',
    badgeDark: true,
    staggered: false,
  },
  {
    id: 4,
    name: 'Rainbow Roll',
    price: '110,000 UZS',
    image:
      'https://images.unsplash.com/photo-1546530785-86397501ae20?auto=format&fit=crop&w=800&q=80',
    description: 'A California core wrapped in a ribbon of assorted fresh fish.',
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

export const aboutMilestones: AboutMilestone[] = [
  {
    year: '2019',
    title: 'Born in Namangan',
    description:
      'SushiGO opened its doors with a single idea — bring modern Japanese dining to the heart of Namangan, where authentic taste and a warm welcome meet.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Sushi chef at work — the first day SushiGO opened',
  },
  {
    year: '2021',
    title: 'A Tokyo-inspired space',
    description:
      'We reimagined our room around contemporary Tokyo interiors — soft lighting, natural wood textures and an open, immersive space that balances elegance and comfort.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'The redesigned SushiGO dining room with wood accents and warm lighting',
  },
  {
    year: '2023',
    title: 'Chef Sato’s craft',
    description:
      'Head chef Kenji Sato brought a reverence for tradition and a modern eye to the kitchen, shaping a menu of signature creations from the first slice to the final garnish.',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Chef Sato plating a signature sushi creation',
  },
  {
    year: 'Today',
    title: 'Where taste meets atmosphere',
    description:
      'Whether it’s a casual dinner or a special occasion, SushiGO is a place where authentic taste, creativity and atmosphere come together — designed to make every visit memorable.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Guests enjoying an evening at SushiGO',
  },
];

export const navLinks: NavLink[] = [
  { label: 'Menu', href: '/menu', active: true },
  { label: 'About', href: '/about' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Contact', href: '#contact' },
];

export const footerExplore: NavLink[] = [
  { label: 'Menu', href: '/menu', active: true },
  { label: 'About', href: '/about' },
  { label: 'Reservations', href: '/reservations' },
  { label: 'Contact', href: '#contact' },
];

export const footerInfo: NavLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
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
    image: 'https://images.unsplash.com/photo-1713453018516-b08018818c0c?auto=format&fit=crop&w=800&q=80',
    badge: "Chef's Choice",
    badgeVariant: 'red',
  },
  {
    id: 2,
    name: 'Salmon Nigiri',
    description: 'Hand-pressed premium vinegared rice with fresh Atlantic salmon.',
    price: '42,000 UZS',
    image: 'https://images.unsplash.com/photo-1657895116421-c1c9596d8dd2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Tonkotsu Ramen',
    description: '12-hour simmered pork broth, chashu pork, and soft egg.',
    price: '65,000 UZS',
    image: 'https://images.unsplash.com/photo-1635379511574-bc167ca085c8?auto=format&fit=crop&w=800&q=80',
    badge: 'Signature',
    badgeVariant: 'frosted',
  },
  {
    id: 4,
    name: 'Rainbow Roll',
    description: 'California roll topped with assorted fresh fish and avocado.',
    price: '58,000 UZS',
    image: 'https://images.unsplash.com/photo-1546530785-86397501ae20?auto=format&fit=crop&w=800&q=80',
  },
];

export interface SignatureDish {
  name: string;
  description: string;
  image: string;
  chefsFavorite?: boolean;
}

export const signatureDishes: SignatureDish[] = [
  {
    name: 'Volcano Roll',
    description:
      'A fiery tempura roll crowned with spicy tuna, sriracha aioli and a torched finish.',
    image:
      'https://images.unsplash.com/photo-1546530785-86397501ae20?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Black Garlic Ramen',
    description:
      'Slow-simmered tonkotsu deepened with black-garlic oil, chashu and a jammy egg.',
    image:
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Truffle Salmon Nigiri',
    description:
      "Chef Sato's favorite — buttery salmon, shaved truffle and a whisper of yuzu.",
    image:
      'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=800&q=80',
    chefsFavorite: true,
  },
];
