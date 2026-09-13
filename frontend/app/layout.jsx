import "./globals.css";
import { Manrope, Cinzel, Cormorant_Garamond } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShopContextProvider from "../contexts/ShopContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Searchbar from "../components/Searchbar";
import StickyCartBar from "../components/StickyCartBar";
import ScrollToTopHandler from "../components/ScrollToTopHandler";

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

export const metadata = {
  title: {
    default: "Majedaar Restaurant — Fresh Authentic Indian Food | Order Online",
    template: "%s | Majedaar Restaurant",
  },
  description:
    "Majedaar Restaurant in Faizabad, UP — fresh authentic Indian food. Order online for home delivery, takeaway or dine-in. Biryanis, Momos, South Indian, Chinese & more.",
  keywords: ["Majedaar Restaurant", "Faizabad", "Indian food", "order online", "biryani", "momos"],
  openGraph: {
    siteName: "Majedaar Restaurant",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cinzel.variable} ${cormorant.variable}`}
    >
      <body className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans overflow-x-hidden antialiased flex flex-col justify-between">
        <ShopContextProvider>
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
      </body>
    </html>
  );
}