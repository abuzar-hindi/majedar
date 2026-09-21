import "./globals.css";
import { Manrope, Cinzel, Cormorant_Garamond } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "../contexts/AuthContext";
import ShopContextProvider from "../contexts/ShopContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Searchbar from "../components/Searchbar";
import StickyCartBar from "../components/StickyCartBar";
import ScrollToTopHandler from "../components/ScrollToTopHandler";
import BrandedLoader from "../components/BrandedLoader";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majedaar.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Majedaar Restaurant | Fresh Indian Food & Online Ordering in Ayodhya",
    template: "%s | Majedaar Restaurant",
  },
  description:
    "Order delicious authentic Indian food online from Majedaar Restaurant in Ayodhya, Uttar Pradesh. Enjoy Biryanis, Momos, South Indian dishes, Chinese, and Thalis. Fast home delivery and warm dine-in.",
  keywords: [
    "Majedaar Restaurant",
    "restaurant in Ayodhya",
    "food in Ayodhya",
    "online food ordering in Ayodhya",
    "order food online from Majedaar",
    "biryani in Ayodhya",
    "best food Ayodhya Faizabad",
    "Majedaar Faizabad",
  ],
  authors: [{ name: "Majedaar Restaurant" }],
  creator: "Majedaar Restaurant",
  publisher: "Majedaar Restaurant",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/brand/logo-mark.svg",
    apple: "/brand/logo-mark.svg",
  },
  openGraph: {
    title: "Majedaar Restaurant | Fresh Indian Food & Online Ordering in Ayodhya",
    description:
      "Order authentic Indian cuisine, freshly prepared biryanis, momos, and regional delicacies from Majedaar Restaurant in Ayodhya.",
    url: siteUrl,
    siteName: "Majedaar Restaurant",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Majedaar Restaurant Ayodhya - Authentic Indian Food",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majedaar Restaurant | Fresh Indian Food & Online Ordering in Ayodhya",
    description:
      "Order authentic Indian cuisine, freshly prepared biryanis, momos, and regional delicacies from Majedaar Restaurant in Ayodhya.",
    images: ["/images/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Majedaar Restaurant",
  alternateName: "Majedaar Restaurant & Cafe",
  image: `${siteUrl}/images/hero.png`,
  logo: `${siteUrl}/brand/logo-full.png`,
  url: siteUrl,
  telephone: "+91-7905404619",
  email: "majedarrestaurant@gmail.com",
  menu: `${siteUrl}/orderanddine`,
  servesCuisine: [
    "Breakfast", "South Indian", "Tea & Coffee", "Momos", "Maggi", "Chinese", "Pasta", "Rice & Biryani", "Burgers", "Sweets", "Dal", "Main Course", "Roti & Papad", "Pizza", "Thali",

  ],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ram Path, Sahabganj - Vaidehi Nagar Rd",
    addressLocality: "Faizabad",
    addressRegion: "Uttar Pradesh",
    postalCode: "224001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "26.7828564",
    longitude: "82.1624034",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "23:30",
    },
  ],
  hasMap:
    "https://www.google.com/maps/place/Majedaar+Restaurant+%26+Cafe/@26.7828564,82.1624034,17z",
  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/orderanddine`,
      inLanguage: "en-IN",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    deliveryMethod: [
      "http://purl.org/goodrelations/v1#DeliveryModePickUp",
      "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cinzel.variable} ${cormorant.variable}`}
    >
      <body className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans overflow-x-hidden antialiased flex flex-col justify-between">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <AuthProvider>
          <ShopContextProvider>
            <BrandedLoader />
            <ScrollToTopHandler />
            <ToastContainer position="bottom-right" />
            <div className="flex flex-col flex-1">
              <Navbar />
              <Searchbar />
              <main className="flex-1">{children}</main>
            </div>
            <StickyCartBar />
            <Footer />
          </ShopContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}