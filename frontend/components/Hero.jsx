"use client";

import { useEffect, useRef, useState, useContext, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShopContext } from "../contexts/ShopContext";

const FALLBACK_CAT_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";

const HeroCategoryTicker = ({ onSelectCategory }) => {
  const router = useRouter();
  const { categories, loading } = useContext(ShopContext);

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isHoveredRef = useRef(false);

  // Only active categories returned from backend, preserving backend order, no "All"
  const activeCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((c) => c.isActive !== false && c.name);
  }, [categories]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    } else {
      router.push(`/orderanddine?category=${encodeURIComponent(catName)}`);
    }
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || activeCategories.length === 0) return;

    if (reducedMotion) {
      track.style.transform = "none";
      return;
    }

    let animationFrameId;
    let lastTime = performance.now();
    let currentX = 0;
    let activeIdx = -1;
    const speed = 30; // px/sec smooth, calm continuous movement

    const singleSetCount = activeCategories.length;
    const computeSingleSetWidth = () => {
      if (!track.children || track.children.length <= singleSetCount) return 0;
      const first = track.children[0];
      const secondSetFirst = track.children[singleSetCount];
      if (!first || !secondSetFirst) return 0;
      return secondSetFirst.offsetLeft - first.offsetLeft;
    };

    let singleSetWidth = computeSingleSetWidth();

    const handleResize = () => {
      singleSetWidth = computeSingleSetWidth();
    };
    window.addEventListener("resize", handleResize);

    const onMouseEnter = () => {
      isHoveredRef.current = true;
    };
    const onMouseLeave = () => {
      isHoveredRef.current = false;
    };

    viewport.addEventListener("mouseenter", onMouseEnter);
    viewport.addEventListener("mouseleave", onMouseLeave);

    const step = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isHoveredRef.current && singleSetWidth > 0) {
        currentX = (currentX + speed * delta) % singleSetWidth;
        track.style.transform = `translate3d(${-currentX}px, 0, 0)`;

        const viewportCenter = viewport.clientWidth / 2;
        const children = track.children;
        let closestIdx = -1;
        let minDiff = Infinity;

        for (let i = 0; i < children.length; i++) {
          const item = children[i];
          const itemCenter = item.offsetLeft + item.offsetWidth / 2 - currentX;
          const diff = Math.abs(itemCenter - viewportCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        }

        // Highlight if within center focal zone (within 70px)
        const activeTarget = minDiff < 70 ? closestIdx : -1;

        if (activeTarget !== activeIdx) {
          if (activeIdx >= 0 && children[activeIdx]) {
            children[activeIdx].classList.remove("is-active");
          }
          if (activeTarget >= 0 && children[activeTarget]) {
            children[activeTarget].classList.add("is-active");
          }
          activeIdx = activeTarget;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      viewport.removeEventListener("mouseenter", onMouseEnter);
      viewport.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [reducedMotion, activeCategories]);

  // Loading state placeholder
  if (loading && activeCategories.length === 0) {
    return (
      <div className="hero-category-ticker" aria-label="Loading food categories">
        <div className="hero-category-ticker__track justify-center">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 animate-pulse flex-none px-3">
              <div className="w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-stone-200/80 border-2 border-stone-200" />
              <div className="w-12 h-3 rounded-md bg-stone-200/80" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Graceful empty state
  if (activeCategories.length === 0) {
    return null;
  }

  // Create enough duplicate sets for an infinite seamless ticker
  const repeatCount = Math.max(3, Math.ceil(18 / activeCategories.length));
  const tickerItems = Array.from({ length: repeatCount }).flatMap(() => activeCategories);

  return (
    <div ref={viewportRef} className="hero-category-ticker" aria-label="Our food categories">
      <div ref={trackRef} className="hero-category-ticker__track">
        {tickerItems.map((cat, index) => {
          const imgUrl = cat.image?.url || FALLBACK_CAT_IMG;
          return (
            <button
              type="button"
              key={`${cat._id || cat.name}-${index}`}
              onClick={() => handleCategoryClick(cat.name)}
              className="hero-category-ticker__item focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/40 rounded-full"
              aria-hidden={index >= activeCategories.length}
              title={`Explore ${cat.name}`}
            >
              <span className="hero-category-ticker__content">
                <span className="hero-category-ticker__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt=""
                    className="hero-category-ticker__img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_CAT_IMG;
                    }}
                  />
                </span>
                <span className="hero-category-ticker__name">{cat.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Hero = ({ onSelectCategory }) => {
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
          {/* Opening Status Badge */}
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3EFE8] text-[#1B3B2B] text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]"></span>
            <span>Open today &bull; 11:00 AM &ndash; 11:30 PM</span>
          </div>

          {/* Main Title */}
          <h1 className="font-hero font-bold text-[clamp(1.75rem,5.2vw,4.5rem)] text-[#11261B] tracking-wider uppercase leading-tight py-1.5 mb-3 text-center overflow-visible">
            MAJEDAAR RESTAURANT
          </h1>

          {/* Category Ticker - Dynamic from Backend */}
          <HeroCategoryTicker onSelectCategory={onSelectCategory} />

          {/* CTA Actions */}
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link href="/orderanddine">
              <button className="px-8 py-3.5 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs cursor-pointer">
                Order Now
              </button>
            </Link>
            <button
              type="button"
              onClick={scrollToMenu}
              className="px-7 py-3.5 rounded-full bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
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
