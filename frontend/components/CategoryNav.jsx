"use client";

const CATEGORY_ITEMS = [
  { name: "Breakfast", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=200&q=80" },
  { name: "South Indian", image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=200&q=80" },
  { name: "Tea & Coffee", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80" },
  { name: "Momos", image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=200&q=80" },
  { name: "Maggi", image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=200&q=80" },
  { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=200&q=80" },
  { name: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281270?auto=format&fit=crop&w=200&q=80" },
  { name: "Rice & Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80" },
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80" },
  { name: "Sweets", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80" },
  { name: "Dal", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80" },
  { name: "Main Course", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80" },
  { name: "Roti & Papad", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=200&q=80" },
  { name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80" },
  { name: "Thali", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=200&q=80" },
];

const CategoryNav = ({ activeCategory, setActiveCategory }) => {
  return (
    <section className="w-full bg-[#FAF8F5] py-8 sm:py-12 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight">
            Food Categories
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 font-normal">Your Choice - Our Kitchen</p>
        </div>

        <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORY_ITEMS.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className="flex flex-col items-center group cursor-pointer flex-none focus:outline-none"
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 transition-all duration-300 border-2 ${
                    isActive
                      ? "border-[#1B3B2B] ring-2 ring-[#1B3B2B]/20 scale-105"
                      : "border-stone-200/90 group-hover:border-stone-300"
                  } bg-stone-100 shadow-2xs`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={`${cat.name} Category at Majedaar Restaurant`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-xs sm:text-sm font-bold tracking-wide transition-colors ${
                    isActive ? "text-[#1B3B2B]" : "text-stone-700 group-hover:text-[#1B3B2B]"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
