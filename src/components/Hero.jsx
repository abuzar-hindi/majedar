import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const HERO_CATEGORIES = [
  "Breakfast",
  "South Indian",
  "Tea & Coffee",
  "Momos",
  "Maggi",
  "Chinese",
  "Pasta",
  "Rice & Biryani",
  "Burgers",
  "Sweets",
  "Dal",
  "Main Course",
  "Roti & Papad",
  "Pizza",
];

const HeroCategoryTicker = () => {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [position, setPosition] = useState(HERO_CATEGORIES.length);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) setPosition(0);
  }, [reducedMotion]);

  useEffect(() => {
    const updateOffset = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const item = track?.children[position];

      if (!viewport || !item) return;

      setOffset(viewport.clientWidth / 2 - (item.offsetLeft + item.offsetWidth / 2));
    };

    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    if (viewportRef.current) observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, [position]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const moveToNextCategory = () => {
      setAnimate(true);
      setPosition((currentPosition) => currentPosition + 1);
    };

    const tickerTimer = window.setInterval(moveToNextCategory, 2400);
    return () => window.clearInterval(tickerTimer);
  }, [reducedMotion]);

  useEffect(() => {
    if (position < HERO_CATEGORIES.length * 2) return undefined;

    const resetTimer = window.setTimeout(() => {
      setAnimate(false);
      setPosition(HERO_CATEGORIES.length);
      window.requestAnimationFrame(() => setAnimate(true));
    }, 1250);

    return () => window.clearTimeout(resetTimer);
  }, [position]);

  return (
    <div
      ref={viewportRef}
      className="hero-category-ticker"
      aria-label="Our food categories"
    >
      <div
        ref={trackRef}
        className={`hero-category-ticker__track${animate ? " is-animated" : ""}`}
        style={{ transform: `translate3d(${offset}px, 0, 0)` }}
      >
        {[...HERO_CATEGORIES, ...HERO_CATEGORIES, ...HERO_CATEGORIES].map(
          (category, index) => (
            <span
              className={`hero-category-ticker__item${
                index === position ? " is-active" : ""
              }`}
              key={`${category}-${index}`}
              aria-hidden={index !== position}
            >
              {category}
            </span>
          )
        )}
      </div>
    </div>
  );
};

const Hero = () => {
  const scrollToMenu = () => {
    const element = document.getElementById("homepage-menu-preview");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-[#FAF8F5] pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-stone-200/60 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* 1. Opening Status Badge */}
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3EFE8] text-[#1B3B2B] text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]"></span>
            <span>Open today • 11:00 AM – 11:30 PM</span>
          </div>

          {/* 2. Main Title (Cinzel - Bold, Tall, Regal, Zero Clipping) */}
          <h1 className="font-hero font-bold text-[clamp(1.75rem,5.2vw,4.5rem)] text-[#11261B] tracking-wider uppercase leading-tight py-1.5 mb-3 text-center overflow-visible">
            MAJEDAR RESTAURANT
          </h1>

          {/* 4. Category Ticker */}
          <HeroCategoryTicker />

          {/* 5. CTA Actions */}
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link to="/orderanddine">
              <button className="px-8 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs">
                Order Now
              </button>
            </Link>
            <button
              onClick={scrollToMenu}
              className="px-7 py-3.5 rounded-full bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-2xs"
            >
              Explore Menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
