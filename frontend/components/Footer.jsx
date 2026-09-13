"use client";
import Link from "next/link";

const Footer = () => {
  const scrollToMenu = () => {
    const element = document.getElementById("ordering-menu");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#11261B] text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-hero font-bold text-white text-xl tracking-wider uppercase">MAJEDAAR</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Fresh, authentic Indian dining &amp; online ordering. Quality ingredients, prepared daily.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <button onClick={scrollToMenu} className="text-left text-stone-300 hover:text-white transition-colors">
                Order Online
              </button>
              <Link href="/orderanddine" className="hover:text-white transition-colors">Order &amp; Dine</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact &amp; Location</Link>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Hours &amp; Info</h4>
            <p className="text-stone-300">Open Daily: 11:00 AM – 11:30 PM</p>
            <p className="text-stone-400">Pickup, Dine-in &amp; Direct Ordering</p>
            <p className="text-stone-400 mt-2">
              Phone: <a href="tel:+917905404619" className="text-white underline">+91 7905404619</a>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Restaurant Highlights</h4>
            <ul className="space-y-1 text-stone-400">
              <li>• Authentic Dum Biryanis</li>
              <li>• Fresh Tandoori Breads &amp; Kebabs</li>
              <li>• Fast Takeout &amp; Ordering</li>
              <li>• Clean &amp; Family-Friendly</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800/80 pt-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} MAJEDAAR RESTAURANT — All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
