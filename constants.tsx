
import { InternetPackage, UserUsage } from './types';

export const FIBER_PACKAGES: InternetPackage[] = [
  { id: 'home-6m', name: 'Home', price: 1500, speed: '6Mbps', duration: '1 Month', type: 'Fiber', devices: 2, color: 'slate', features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support'] },
  { id: 'lite-8m', name: 'Lite', price: 1850, speed: '8Mbps', duration: '1 Month', type: 'Fiber', devices: 4, color: 'emerald', features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support'] },
  { id: 'edge-12m', name: 'Edge', price: 2000, speed: '12Mbps', duration: '1 Month', type: 'Fiber', devices: 6, color: 'blue', features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support'] },
  { id: 'silver-20m', name: 'Silver', price: 2299, speed: '20Mbps', duration: '1 Month', type: 'Fiber', devices: 8, color: 'cyan', isPopular: true, features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support', 'Fast Streaming'] },
  { id: 'mantle-32m', name: 'Mantle', price: 2899, speed: '32Mbps', duration: '1 Month', type: 'Fiber', devices: 12, color: 'indigo', features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support', 'Multiple Users'] },
  { id: 'crust-40m', name: 'Crust', price: 3799, speed: '40Mbps', duration: '1 Month', type: 'Fiber', devices: 15, color: 'violet', features: ['Unlimited Data', 'PPPoE Connection', '24/7 Support', '4K Streaming'] },
  { id: 'platinum-70m', name: 'Platinum', price: 5499, speed: '70Mbps', duration: '1 Month', type: 'Fiber', devices: 25, color: 'rose', features: ['Unlimited Data', 'PPPoE Connection', 'Priority Support', 'Heavy Gaming'] },
  { id: 'gold-100m', name: 'Gold', price: 10000, speed: '100Mbps', duration: '1 Month', type: 'Fiber', devices: 50, color: 'amber', features: ['Unlimited Data', 'PPPoE Connection', 'Priority Support', 'Enterprise Grade'] },
];

export const HOTSPOT_PACKAGES: InternetPackage[] = [
  { id: 'hs-kumi', name: 'Kumi Unlimited', price: 10, speed: '', duration: '1 Hour', type: 'Hotspot', devices: 2, color: 'slate', features: ['Unlimited 2 Devices', 'Instant Activation', 'Shield Protected'] },
  { id: 'hs-mbao', name: 'Mbao Unlimited', price: 20, speed: '', duration: '2.5 Hours', type: 'Hotspot', devices: 2, color: 'emerald', features: ['Unlimited Access', '2 Devices', 'Shield Protected'] },
  { id: 'hs-chuani', name: 'Chuani Unlimited', price: 50, speed: '', duration: '8 Hours', type: 'Hotspot', devices: 3, color: 'blue', features: ['Unlimited 3 Devices', 'Instant Activation', 'Shield Protected'] },
  { id: 'hs-daily', name: 'Daily Unlimited', price: 80, speed: '', duration: '1 Day', type: 'Hotspot', devices: 3, color: 'cyan', features: ['24 Hour Access', '3 Devices', 'Shield Protected'] },
  { id: 'hs-weekly-solo', name: 'Weekly Solo', price: 280, speed: '', duration: '7 Days', type: 'Hotspot', devices: 1, color: 'indigo', features: ['Solo Account', '7 Day Access', 'Shield Protected'] },
  { id: 'hs-weekly-duo', name: 'Weekly Duo', price: 380, speed: '', duration: '7 Days', type: 'Hotspot', devices: 2, color: 'violet', features: ['Dual Account', '7 Day Access', 'Shield Protected'] },
  { id: 'hs-weekly-trio', name: 'Weekly Trio', price: 400, speed: '', duration: '7 Days', type: 'Hotspot', devices: 3, color: 'rose', isPopular: true, features: ['Trio Account', '7 Day Access', 'Shield Protected'] },
  { id: 'hs-biweekly', name: 'Bi-Weekly Unlimited', price: 550, speed: '', duration: '14 Days', type: 'Hotspot', devices: 3, color: 'amber', features: ['14 Day Access', '3 Devices', 'Shield Protected'] },
  { id: 'hs-monthly-solo', name: 'Monthly Solo', price: 1000, speed: '', duration: '1 Month', type: 'Hotspot', devices: 1, color: 'fuchsia', features: ['Monthly Account', 'Solo User', 'Shield Protected'] },
];

export const NETWORKING_SERVICES = [
  {
    title: 'Cable Crimping & Termination',
    icon: 'fa-network-wired',
    image: 'https://images.unsplash.com/photo-1596207891316-23851be3cc20?auto=format&fit=crop&q=80&w=800',
    desc: 'Precision termination for CAT6/7 infrastructure. We ensure zero packet loss through certified RJ45 crimping and rigorous throughput testing.',
    specs: ['Fluke Certified', 'Gold-Plated Tips', 'T568B Standard']
  },
  {
    title: 'Server Cabinet & Rack Setup',
    icon: 'fa-server',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800',
    desc: 'Industrial-grade cabinet organization. We handle everything from rack mounting to sophisticated cable management and cooling optimization.',
    specs: ['42U/24U Standard', 'Smart Cable Trays', 'Thermal Mapping']
  },
  {
    title: 'Fiber Optic Splicing',
    icon: 'fa-bolt-lightning',
    image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=800',
    desc: 'High-precision fusion splicing for FTTH and enterprise backbones. Our splicing ensures minimal attenuation and maximum signal integrity.',
    specs: ['Fusion Splicing', 'OTDR Testing', 'Single/Multi Mode']
  },
  {
    title: 'WiFi 6 Mesh Ecosystems',
    icon: 'fa-wifi',
    image: 'https://images.unsplash.com/photo-1600132806638-2cd81395567a?auto=format&fit=crop&q=80&w=800',
    desc: 'Eliminate dead zones with next-gen WiFi 6 mesh solutions. Intelligent handoff and multi-gigabit wireless performance for smart homes.',
    specs: ['802.11ax Ready', 'Seamless Roaming', 'OFDMA Support']
  }
];

export const CONSULTING_SERVICES = [
  {
    title: 'Cloud Strategy',
    icon: 'fa-cloud-arrow-up',
    desc: 'Seamless migration to Azure, AWS, or Google Cloud tailored for Kenyan business workflows.'
  },
  {
    title: 'Cybersecurity Audit',
    icon: 'fa-user-shield',
    desc: 'Vulnerability assessments, penetration testing, and employee security awareness training.'
  },
  {
    title: 'IT Infrastructure Design',
    icon: 'fa-diagram-project',
    desc: 'Scalable roadmap development for hardware and software systems to fuel your growth.'
  }
];

export const MOCK_USAGE_DATA: UserUsage[] = [
  { date: 'Mon', download: 45, upload: 12 },
  { date: 'Tue', download: 52, upload: 15 },
  { date: 'Wed', download: 38, upload: 10 },
  { date: 'Thu', download: 65, upload: 22 },
  { date: 'Fri', download: 88, upload: 30 },
  { date: 'Sat', download: 120, upload: 45 },
  { date: 'Sun', download: 95, upload: 35 },
];
