// ─── Mock Data — Majedaar Restaurant Admin ─────────────────────────────────
// Keep all mock data here. Easy to swap with real API responses later.

export const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: "orders",
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: "bookings",
  },
  {
    label: "Menu",
    href: "/dashboard/menu",
    icon: "menu",
    children: [
      { label: "All Items", href: "/dashboard/menu" },
      { label: "Add Item", href: "/dashboard/menu/add" },
      { label: "Categories", href: "/dashboard/categories" },
    ],
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: "customers",
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: "payments",
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: "messages",
    badge: 1,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
  },
];

export const orders = [
  {
    id: "#MJ-2841",
    customer: "Aarav Sharma",
    phone: "+91 98765 44021",
    address: "14, Green Park Colony, Near Bus Stand, Faizabad, UP 224001",
    items: "Paneer Chilli x1, Veg Biryani x1",
    itemList: [
      { name: "Paneer Chilli", variant: "Full", qty: 1, price: 260, total: 260 },
      { name: "Veg Biryani", variant: "Full", qty: 1, price: 240, total: 240 },
    ],
    subtotal: 500,
    deliveryFee: 100,
    amount: "₹486",
    total: 600,
    payment: "Paid",
    paymentMethod: "UPI",
    paymentId: "pay_MJ42A",
    status: "Preparing",
    deliveryType: "Home Delivery",
    time: "12:42 PM",
    date: "Today",
  },
  {
    id: "#MJ-2840",
    customer: "Meera Kapoor",
    phone: "+91 98102 11688",
    address: "B-12, Ram Nagar, Faizabad, UP 224001",
    items: "Veg Burger x2, Masala Fries",
    itemList: [
      { name: "Veg Burger", variant: "Single", qty: 2, price: 190, total: 380 },
      { name: "Masala Fries", variant: "Single", qty: 1, price: 120, total: 120 },
    ],
    subtotal: 500,
    deliveryFee: 100,
    amount: "₹598",
    total: 700,
    payment: "Paid",
    paymentMethod: "Card",
    paymentId: "pay_MJ41B",
    status: "Ready",
    deliveryType: "Home Delivery",
    time: "12:26 PM",
    date: "Today",
  },
  {
    id: "#MJ-2839",
    customer: "Kabir Malhotra",
    phone: "+91 99991 22440",
    address: "C-5, Civil Lines, Faizabad, UP 224001",
    items: "Chicken Biryani, Raita",
    itemList: [
      { name: "Chicken Biryani", variant: "Full", qty: 1, price: 320, total: 320 },
      { name: "Raita", variant: "Single", qty: 1, price: 60, total: 60 },
    ],
    subtotal: 380,
    deliveryFee: 100,
    amount: "₹420",
    total: 480,
    payment: "Pending",
    paymentMethod: "UPI",
    paymentId: "",
    status: "Pending",
    deliveryType: "Home Delivery",
    time: "12:08 PM",
    date: "Today",
  },
  {
    id: "#MJ-2838",
    customer: "Ishita Verma",
    phone: "+91 98990 76211",
    address: "Plot 22, Sahabganj, Faizabad, UP 224001",
    items: "Margherita Pizza",
    itemList: [
      { name: "Margherita Pizza", variant: "Full", qty: 1, price: 280, total: 280 },
    ],
    subtotal: 280,
    deliveryFee: 100,
    amount: "₹349",
    total: 380,
    payment: "Paid",
    paymentMethod: "UPI",
    paymentId: "pay_MJ40A",
    status: "Out for Delivery",
    deliveryType: "Home Delivery",
    time: "11:52 AM",
    date: "Today",
  },
  {
    id: "#MJ-2837",
    customer: "Rohan Bedi",
    phone: "+91 98111 08120",
    address: "Dine-in — Table T-03",
    items: "Masala Dosa, Filter Coffee",
    itemList: [
      { name: "Masala Dosa", variant: "Single", qty: 1, price: 160, total: 160 },
      { name: "Filter Coffee", variant: "Single", qty: 1, price: 80, total: 80 },
    ],
    subtotal: 240,
    deliveryFee: 0,
    amount: "₹280",
    total: 280,
    payment: "Paid",
    paymentMethod: "Cash",
    paymentId: "",
    status: "Delivered",
    deliveryType: "Dine-in",
    time: "11:35 AM",
    date: "Today",
  },
  {
    id: "#MJ-2836",
    customer: "Ananya Joshi",
    phone: "+91 98731 90112",
    address: "44, Naya Ganj, Faizabad, UP 224001",
    items: "Paneer Burger, Lemon Tea",
    itemList: [
      { name: "Paneer Burger", variant: "Single", qty: 1, price: 200, total: 200 },
      { name: "Lemon Tea", variant: "Single", qty: 1, price: 60, total: 60 },
    ],
    subtotal: 260,
    deliveryFee: 100,
    amount: "₹318",
    total: 360,
    payment: "Failed",
    paymentMethod: "UPI",
    paymentId: "",
    status: "Cancelled",
    deliveryType: "Home Delivery",
    time: "11:18 AM",
    date: "Today",
  },
];

export const bookings = [
  { id: "BK-0182", customer: "Naina Bhatia", phone: "+91 98710 33219", date: "Today", time: "7:30 PM", guests: 4, table: "T-06", status: "Confirmed", notes: "Window seat preferred" },
  { id: "BK-0181", customer: "Vikram Sethi", phone: "+91 98100 45019", date: "Today", time: "8:00 PM", guests: 2, table: "T-02", status: "Pending", notes: "Anniversary dinner" },
  { id: "BK-0180", customer: "Sanya Arora", phone: "+91 99999 12009", date: "Tomorrow", time: "1:00 PM", guests: 6, table: "T-11", status: "Confirmed", notes: "High chair required" },
  { id: "BK-0179", customer: "Dev Mehta", phone: "+91 98188 62110", date: "Tomorrow", time: "8:30 PM", guests: 3, table: "T-04", status: "Completed", notes: "" },
  { id: "BK-0178", customer: "Pihu Khanna", phone: "+91 99101 80042", date: "12 Sep 2026", time: "7:00 PM", guests: 5, table: "T-09", status: "Cancelled", notes: "" },
];

export const menuItems = [
  { id: "MI-01", name: "Paneer Chilli", category: "Chinese", price: "₹260", variants: "Single", available: true, featured: true, image: "PC" },
  { id: "MI-02", name: "Veg Burger", category: "Burgers", price: "₹190", variants: "Single", available: true, featured: true, image: "VB" },
  { id: "MI-03", name: "Hakka Noodles", category: "Chinese", price: "₹220", variants: "Half / Full", available: true, featured: false, image: "HN" },
  { id: "MI-04", name: "Paneer Tikka Pizza", category: "Pizza", price: "₹380", variants: "Half / Full", available: false, featured: false, image: "PP" },
  { id: "MI-05", name: "Masala Dosa", category: "South Indian", price: "₹160", variants: "Single", available: true, featured: true, image: "MD" },
  { id: "MI-06", name: "Veg Biryani", category: "Rice & Biryani", price: "₹240", variants: "Single", available: true, featured: false, image: "VB" },
];

export const categories = [
  "Breakfast", "South Indian", "Tea & Coffee", "Momos", "Maggi",
  "Chinese", "Pasta", "Rice & Biryani", "Burgers", "Sweets",
  "Dal", "Main Course", "Roti & Papad", "Pizza", "Thali",
];

export const customers = [
  { name: "Aarav Sharma", phone: "+91 98765 44021", email: "aarav.s@example.com", orders: 12, bookings: 3, spent: "₹18,420", last: "Today, 12:42 PM" },
  { name: "Meera Kapoor", phone: "+91 98102 11688", email: "meera.k@example.com", orders: 8, bookings: 2, spent: "₹15,180", last: "Today, 12:26 PM" },
  { name: "Kabir Malhotra", phone: "+91 99991 22440", email: "kabir.m@example.com", orders: 5, bookings: 1, spent: "₹13,240", last: "Today, 12:08 PM" },
  { name: "Ishita Verma", phone: "+91 98990 76211", email: "ishita.v@example.com", orders: 16, bookings: 4, spent: "₹11,760", last: "Yesterday, 8:20 PM" },
];

export const payments = [
  { id: "pay_MJ42A", order: "#MJ-2841", customer: "Aarav Sharma", amount: "₹486", method: "UPI", status: "Paid", date: "Today, 12:42 PM" },
  { id: "pay_MJ41B", order: "#MJ-2840", customer: "Meera Kapoor", amount: "₹598", method: "Card", status: "Paid", date: "Today, 12:26 PM" },
  { id: "pay_MJ40C", order: "#MJ-2839", customer: "Kabir Malhotra", amount: "₹420", method: "UPI", status: "Pending", date: "Today, 12:08 PM" },
  { id: "pay_MJ39D", order: "#MJ-2836", customer: "Ananya Joshi", amount: "₹318", method: "UPI", status: "Failed", date: "Today, 11:18 AM" },
  { id: "pay_MJ38E", order: "#MJ-2801", customer: "Riya Jain", amount: "₹760", method: "Card", status: "Refunded", date: "10 Sep 2026" },
];

export const messages = [
  { id: "MSG-01", name: "Nikhil Jain", contact: "+91 98100 22014", type: "Order help", preview: "I need to update the delivery address for my order...", date: "Today, 11:20 AM", status: "New", full: "Hi, I need to update the delivery address for my recent order #MJ-2835. Please change it to 22, Model Town, Faizabad." },
  { id: "MSG-02", name: "Shreya Das", contact: "shreya.d@example.com", type: "Feedback", preview: "Loved the food. Can you add more no-onion options?", date: "Yesterday, 4:12 PM", status: "Read", full: "Loved the food yesterday! The momos were excellent. Could you please add more no-onion/no-garlic options on the menu for people like me?" },
  { id: "MSG-03", name: "Mohit Suri", contact: "+91 98990 11442", type: "Complaint", preview: "The drink was missing from my order yesterday.", date: "10 Sep 2026", status: "Resolved", full: "My order yesterday was missing the cold coffee that I paid for. Please refund or arrange a replacement. Order ID was #MJ-2810." },
];

export const drivers = [
  { id: "DRV-01", name: "Raju Singh", phone: "+91 98765 11001" },
  { id: "DRV-02", name: "Mohan Das", phone: "+91 99101 44201" },
  { id: "DRV-03", name: "Arjun Kumar", phone: "+91 98110 32001" },
];

export const adminProfile = {
  name: "Ananya Kapoor",
  email: "ananya@majedaar.in",
  phone: "+91 98765 00000",
  role: "Administrator",
  initials: "AK",
};

export const restaurantSettings = {
  name: "Majedaar Restaurant",
  phone: "+91 7905404619",
  email: "majedarrestaurant@gmail.com",
  address: "Ram Path, Sahabganj - Vaidehi Nagar Rd, Faizabad, Uttar Pradesh 224001",
  openingTime: "11:00",
  closingTime: "23:30",
  hoursActive: true,
  deliveryFee: 100,
  minimumOrder: 199,
  acceptingOrders: true,
  isOpen: true,
  whatsapp: "+91 7525899794",
  instagram: "@majedar.restaurant",
};