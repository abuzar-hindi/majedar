"use client";
import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../lib/data/assets";

const FALLBACK_IMG =
  assets.placeholder_food ||
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

const BestsellerSection = () => {
  const { products, currency, addToCart } = useContext(ShopContext);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  const setItemVariant = (itemId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [itemId]: variant }));
  };

  const bestsellers = Array.isArray(products)
    ? products.filter((p) => p.isBestseller || p.bestseller || p.isFeatured)
    : [];

  const count = bestsellers.length;
  // Triplicate list for smooth infinite looping without visual jumps
  const displayItems = count > 0 ? [...bestsellers, ...bestsellers, ...bestsellers] : [];

  const [currentIndex, setCurrentIndex] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isInteractingRef = useRef(false);
  const idleTimerRef = useRef(null);
  const stepTimerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const isSwipingRef = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  const getImg = (item) => item.image?.url || item.images?.[0] || FALLBACK_IMG;

  // Position the track so the card at `index` is visually centered
  const updateTrackPosition = useCallback((targetIndex, animate = true) => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || !track.children[targetIndex]) return;

    const containerWidth = container.clientWidth;
    const card = track.children[targetIndex];
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const targetTranslateX = containerWidth / 2 - cardCenter;

    if (animate && !reducedMotion) {
      track.style.transition = "transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)";
    } else {
      track.style.transition = "none";
    }

    track.style.transform = `translate3d(${targetTranslateX}px, 0, 0)`;
  }, [reducedMotion]);

  // Handle window resize to keep centered card accurately positioned
  useEffect(() => {
    const handleResize = () => {
      updateTrackPosition(currentIndex, false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex, updateTrackPosition]);

  // Position on initial load or count change
  useEffect(() => {
    if (count > 0) {
      setCurrentIndex(count);
      // Let DOM render then position without animation
      const raf = requestAnimationFrame(() => {
        updateTrackPosition(count, false);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [count, updateTrackPosition]);

  // Seamless boundary wrap when animation finishes
  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
    if (count === 0) return;

    if (currentIndex >= count * 2) {
      const resetIndex = currentIndex - count;
      setCurrentIndex(resetIndex);
      updateTrackPosition(resetIndex, false);
    } else if (currentIndex < count) {
      const resetIndex = currentIndex + count;
      setCurrentIndex(resetIndex);
      updateTrackPosition(resetIndex, false);
    }
  }, [count, currentIndex, updateTrackPosition]);

  // Stepping functions
  const stepTo = useCallback((targetIndex) => {
    if (count === 0) return;
    setIsAnimating(true);
    setCurrentIndex(targetIndex);
    updateTrackPosition(targetIndex, true);
  }, [count, updateTrackPosition]);

  const stepNext = useCallback(() => {
    stepTo(currentIndex + 1);
  }, [currentIndex, stepTo]);

  const stepPrev = useCallback(() => {
    stepTo(currentIndex - 1);
  }, [currentIndex, stepTo]);

  // User interaction pause/resume
  const pauseAutoStep = useCallback(() => {
    isInteractingRef.current = true;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
  }, []);

  const resumeAutoStep = useCallback((delay = 3000) => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, delay);
  }, []);

  // STEP -> STOP -> HOLD (~2s) -> STEP sequence
  useEffect(() => {
    if (reducedMotion || count === 0) return;

    const scheduleNextStep = () => {
      stepTimerRef.current = setTimeout(() => {
        if (!isInteractingRef.current) {
          stepNext();
        } else {
          scheduleNextStep();
        }
      }, 2600); // 2000ms hold + 550ms transition + 50ms buffer
    };

    scheduleNextStep();

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [count, currentIndex, isAnimating, reducedMotion, stepNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    pauseAutoStep();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartXRef.current;
    const diffY = touch.clientY - touchStartYRef.current;

    // Detect horizontal swipe intent
    if (!isSwipingRef.current && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwipingRef.current = true;
    }

    if (isSwipingRef.current) {
      touchDeltaXRef.current = diffX;
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingRef.current) {
      const delta = touchDeltaXRef.current;
      if (delta < -35) {
        stepNext();
      } else if (delta > 35) {
        stepPrev();
      }
    }
    isSwipingRef.current = false;
    resumeAutoStep(3200);
  };

  const handleManualNav = (dir) => {
    pauseAutoStep();
    if (dir > 0) {
      stepNext();
    } else {
      stepPrev();
    }
    resumeAutoStep(3500);
  };

  if (count === 0) return null;

  return (
    <section className="w-full bg-[#FAF8F5] py-10 sm:py-14 border-b border-stone-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight">
              What people love
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 font-normal">Our most-loved dishes.</p>
          </div>

          {/* Desktop arrows for accessible navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => handleManualNav(-1)}
              aria-label="Previous dishes"
              className="w-8 h-8 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-[#1B3B2B] hover:border-stone-400 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleManualNav(1)}
              aria-label="Next dishes"
              className="w-8 h-8 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-[#1B3B2B] hover:border-stone-400 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={containerRef}
          onMouseEnter={pauseAutoStep}
          onMouseLeave={() => resumeAutoStep(2000)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full overflow-hidden py-4 -my-4"
          style={{ touchAction: "pan-y" }}
        >
          {/* Inner Sliding Track */}
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="flex gap-4 sm:gap-6 will-change-transform"
            style={{ width: "max-content" }}
          >
            {displayItems.map((item, idx) => {
              const isActive = idx === currentIndex;
              const isAvailable = item.isAvailable !== false;
              const isHalfFull = item.pricingType === "half-full";
              const currentVariant = isHalfFull
                ? selectedVariants[item._id] || "full"
                : "single";

              const displayPrice = isHalfFull
                ? currentVariant === "half"
                  ? item.halfPrice
                  : item.fullPrice
                : item.price || 0;

              return (
                <div
                  key={`${item._id}-${idx}`}
                  onClick={() => {
                    if (!isActive) {
                      pauseAutoStep();
                      stepTo(idx);
                      resumeAutoStep(3200);
                    }
                  }}
                  className={`flex-none w-[220px] sm:w-[250px] md:w-[260px] bg-white rounded-2xl p-4 border transition-all duration-500 flex flex-col items-center text-center justify-between group cursor-pointer ${isActive
                      ? "border-[#1B3B2B]/40 shadow-md scale-[1.04] z-10 opacity-100"
                      : "border-stone-200/80 shadow-2xs scale-100 opacity-80 hover:opacity-100 hover:border-stone-300"
                    }`}
                  style={{
                    transformOrigin: "center center",
                  }}
                >
                  {/* Food image with clean circular ratio and fallback */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-3 border-2 border-stone-100 shadow-2xs bg-stone-100 group-hover:scale-105 transition-transform duration-300 flex-none relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImg(item)}
                      alt={`${item.name} at Majedaar Restaurant`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                    {item.isVeg !== undefined && (
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-stone-200">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-[#C85A17] bg-[#FDF2EC] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 flex-none">
                    Bestseller
                  </span>

                  <h3
                    className={`font-bold text-xs sm:text-sm line-clamp-1 mb-1 text-center w-full transition-colors ${isActive ? "text-[#11261B]" : "text-stone-800"
                      }`}
                  >
                    {item.name}
                  </h3>

                  <div className="inline-flex items-center gap-1 text-[11px] mb-1 flex-none">
                    {item.ratingSummary?.reviewCount > 0 ? (
                      <>
                        <span className="text-amber-500">★</span>
                        <span className="font-bold text-[#11261B]">{item.ratingSummary.averageRating}</span>
                        <span className="text-stone-400">· {item.ratingSummary.reviewCount}</span>
                      </>
                    ) : (
                      <span className="text-stone-400 flex items-center gap-1 text-[10px]">
                        <span className="text-stone-300">★</span> New
                      </span>
                    )}
                  </div>

                  <p className="text-stone-500 text-[11px] sm:text-xs line-clamp-2 leading-snug mb-2 text-center min-h-[2rem]">
                    {item.description}
                  </p>

                  {/* Half / Full Variant Selector */}
                  {isHalfFull && (
                    <div className="flex items-center gap-1.5 mb-2.5 flex-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemVariant(item._id, "half");
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                          currentVariant === "half"
                            ? "bg-[#1B3B2B] text-white border-[#1B3B2B]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        Half: {currency}{item.halfPrice}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemVariant(item._id, "full");
                        }}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                          currentVariant === "full"
                            ? "bg-[#1B3B2B] text-white border-[#1B3B2B]"
                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        Full: {currency}{item.fullPrice}
                      </button>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
                    <span className="text-sm font-extrabold text-[#1B3B2B]">
                      {currency}{displayPrice}
                    </span>
                    {isAvailable ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item._id, currentVariant);
                        }}
                        className="px-3 py-1 rounded-full bg-[#1B3B2B] hover:bg-[#11261B] text-white text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                      >
                        <span>ADD</span>
                        <span>+</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestsellerSection;
