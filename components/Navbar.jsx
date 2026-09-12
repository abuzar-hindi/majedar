"use client";
import { useContext, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShopContext } from "../contexts/ShopContext";

const ACCOUNT_MENU = [
  { href: "/my-orders",   label: "My Orders",       icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/my-bookings", label: "My Bookings",     icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/my-profile",  label: "My Profile",      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/help",        label: "Help & Support",  icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/faqs",        label: "FAQs",            icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { setShowSearch, getCartCounts, navigate } = useContext(ShopContext);
  const pathname = usePathname();
  const accountRef = useRef(null);

  const isActive = (path) => pathname === path;

  const navLinkClass = (path) =>
    `transition-colors ${isActive(path) ? "text-[#1B3B2B] font-extrabold" : "hover:text-[#1B3B2B]"}`;

  const scrollToMenu = () => {
    const el = document.getElementById("ordering-menu");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  const isAccountSection = ACCOUNT_MENU.some((item) => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex flex-col">
            <span className="font-hero font-bold text-xl text-[#1B3B2B] tracking-wider leading-none uppercase">
              Majedar
            </span>
            <span className="text-[9px] font-semibold text-[#5A6561] tracking-[0.2em] uppercase mt-0.5">
              Restaurant
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-stone-700">
          <Link href="/" className={navLinkClass("/")}>Home</Link>
          <Link href="/orderanddine" className={navLinkClass("/orderanddine")}>Order &amp; Dine</Link>
          <Link href="/contact" className={navLinkClass("/contact")}>Contact</Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Search */}
          <button
            onClick={() => {
              setShowSearch(true);
              const searchInput = document.getElementById("homepage-search-input");
              if (searchInput) {
                searchInput.focus();
              } else {
                navigate("/");
              }
            }}
            className="p-2 rounded-full text-stone-600 hover:text-[#1B3B2B] hover:bg-stone-200/60 transition-colors"
            title="Search dishes"
            aria-label="Search dishes"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-full text-stone-600 hover:text-[#1B3B2B] hover:bg-stone-200/60 transition-colors" aria-label="Cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {getCartCounts() > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center bg-[#C85A17] text-white text-[10px] font-bold w-4 h-4 rounded-full">
                {getCartCounts()}
              </span>
            )}
          </Link>

          {/* Account Icon + Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setAccountOpen((prev) => !prev)}
              className={`p-2 rounded-full transition-colors ${
                isAccountSection || accountOpen
                  ? "text-[#1B3B2B] bg-stone-200/60"
                  : "text-stone-600 hover:text-[#1B3B2B] hover:bg-stone-200/60"
              }`}
              aria-label="Account menu"
              aria-expanded={accountOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Dropdown */}
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#FAF8F5] border border-stone-200 rounded-xl shadow-md overflow-hidden z-50">
                <div className="px-3.5 pt-3 pb-2 border-b border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Account</p>
                </div>
                <div className="py-1.5">
                  {ACCOUNT_MENU.map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                        pathname === href
                          ? "text-[#1B3B2B] bg-stone-100"
                          : "text-stone-700 hover:text-[#1B3B2B] hover:bg-stone-100/80"
                      }`}
                    >
                      <svg className="w-4 h-4 flex-none text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={icon} />
                      </svg>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Now — desktop only */}
          <button
            onClick={scrollToMenu}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1B3B2B] text-white text-xs font-bold tracking-wide uppercase hover:bg-[#11261B] active:scale-95 transition-all shadow-2xs"
          >
            Order Now
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setVisible(true)}
            className="p-2 rounded-lg md:hidden text-stone-600 hover:bg-stone-200/60 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed z-50 top-0 right-0 h-full bg-[#FAF8F5] shadow-xl transition-all duration-300 ${
            visible ? "w-72 translate-x-0" : "w-0 translate-x-full"
          } overflow-hidden`}
        >
          <div className="flex flex-col h-full text-stone-800 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#1B3B2B] text-white flex items-center justify-center font-bold text-sm">M</div>
                <span className="font-bold text-sm text-[#1B3B2B]">MAJEDAAR</span>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="p-1 rounded-md text-stone-500 hover:text-stone-800"
                aria-label="Close Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 pt-4 flex flex-col gap-1 text-sm font-medium overflow-y-auto">
              {[
                { href: "/", label: "Home" },
                { href: "/orderanddine", label: "Order & Dine" },
                { href: "/contact", label: "Contact" },
                { href: "/reserve-table", label: "Reserve a Table" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setVisible(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-stone-200/60 text-stone-700"
                >
                  {label}
                </Link>
              ))}

              {/* Account section in mobile drawer */}
              <div className="mt-3 pt-3 border-t border-stone-200">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-1.5">Account</p>
                {ACCOUNT_MENU.map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setVisible(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === href
                        ? "text-[#1B3B2B] bg-stone-100 font-semibold"
                        : "text-stone-700 hover:bg-stone-200/60"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-none text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={icon} />
                    </svg>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="pt-4 border-t border-stone-200">
              <button
                onClick={() => { setVisible(false); scrollToMenu(); }}
                className="w-full py-2.5 rounded-lg bg-[#1B3B2B] text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;