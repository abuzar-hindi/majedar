# The Sizzle Restaurant Website

A modern, responsive restaurant website built with React and Tailwind CSS. Converted from the Restoran Bootstrap template while maintaining the exact visual design and layout.

## 🏢 Business Information

**Restaurant Name:** The Sizzle Restaurant (थे सिजल रेस्टोरेंट)  
**Category:** Restaurant  
**Price Range:** ₹400–600 per person  
**Google Rating:** 4.7 ⭐ (23 reviews)

**Address:**  
4106/4110, Opposite BSNL Office, Civil Line, Faizabad, Uttar Pradesh 224001

**Phone:** +91 92363 59327  
**Google Maps:** [View on Google Maps](https://maps.app.goo.gl/bH29boh1KwaSn37N9)

## ✨ Features

- **Fully Responsive Design** - Mobile-first approach, works perfectly on all devices
- **Modern React Components** - Clean, reusable component structure
- **Tailwind CSS Styling** - Utility-first CSS framework
- **Smooth Scrolling** - Seamless navigation between sections
- **Floating Action Buttons** - Quick access to WhatsApp and phone calls
- **Interactive Menu** - Tabbed menu with breakfast, lunch, and dinner options
- **Google Maps Integration** - Embedded map for easy location finding
- **Contact Form** - Easy way for customers to reach out

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.jsx      # Navigation bar
│   ├── Hero.jsx        # Hero section with CTA
│   ├── About.jsx       # About Us section
│   ├── Services.jsx    # Services & Highlights
│   ├── Menu.jsx        # Food menu with tabs
│   ├── Gallery.jsx     # Photo gallery
│   ├── Reviews.jsx     # Customer reviews
│   ├── Contact.jsx     # Contact form & map
│   ├── Footer.jsx      # Footer section
│   └── FloatingButtons.jsx  # WhatsApp & Call buttons
├── pages/
│   └── Home.jsx        # Main home page
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles & Tailwind imports
```

## 🎨 Design Details

The design maintains the exact visual appearance of the original Restoran template:

- **Primary Color:** #FEA116 (Golden Orange)
- **Dark Color:** #0F172B (Deep Blue)
- **Light Color:** #F1F8FF (Light Blue)
- **Fonts:** Heebo, Nunito, Pacifico (Google Fonts)
- **Icons:** Font Awesome 6

## 📱 Sections

1. **Navbar** - Sticky navigation with smooth scroll links
2. **Hero** - Welcome section with Call Now and View Menu CTAs
3. **Services & Highlights** - Live Music, Rooftop Seating, Sports Screening
4. **About Us** - Restaurant information and highlights
5. **Menu** - Tabbed menu (Breakfast, Lunch, Dinner)
6. **Gallery** - Photo gallery showcasing food and ambiance
7. **Reviews** - Customer testimonials with ratings
8. **Contact** - Contact form and embedded Google Maps
9. **Footer** - Business details, hours, and newsletter signup

## 🔧 Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Font Awesome** - Icon library
- **Google Fonts** - Typography

## 📝 Notes

- All images are stored in the `public/images/` directory
- The contact form currently shows an alert on submission (backend integration can be added)
- WhatsApp button opens a chat with a pre-filled message
- Call Now buttons use `tel:` links for mobile devices
- Google Maps embed uses the provided restaurant location

## 📄 License

This project is for The Sizzle Restaurant. All rights reserved.

