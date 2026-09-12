import { useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";
import { assets } from "../assets/assets";

const Menu = ({ selectedCategory = "All" }) => {
  const { products, currency, addToCart, search } = useContext(ShopContext);
  const [selectedTypeMap, setSelectedTypeMap] = useState({});

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((item) => {
      // Search filter
      if (search && search.trim() !== "") {
        const query = search.toLowerCase().trim();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesDesc) return false;
      }

      // Category filter
      if (!selectedCategory || selectedCategory === "All") return true;

      const catLower = selectedCategory.toLowerCase();
      const itemCatLower = (item.category || "").toLowerCase();

      if (catLower === "biryani") return itemCatLower.includes("biryani");
      if (catLower === "chicken") return itemCatLower.includes("chicken");
      if (catLower === "chinese") return itemCatLower.includes("chinese");
      if (catLower === "pizza") return itemCatLower.includes("pizza");
      if (catLower === "snacks") return itemCatLower.includes("snack") || itemCatLower.includes("starter");
      if (catLower === "beverages") return itemCatLower.includes("beverage") || itemCatLower.includes("drink") || itemCatLower.includes("tea") || itemCatLower.includes("coffee");
      if (catLower === "desserts") return itemCatLower.includes("dessert") || itemCatLower.includes("sweet");

      return itemCatLower.includes(catLower);
    });
  }, [products, selectedCategory, search]);

  const priceDisplay = (item) => {
    if (Array.isArray(item.types) && item.types.length > 0) {
      if (item.types.length === 1) return `${currency}${item.types[0].price}`;
      return `${currency}${item.types[0].price} – ${currency}${item.types[item.types.length - 1].price}`;
    }
    if (typeof item.price === "number") return `${currency}${item.price}`;
    return `${currency}${item.priceHalf || item.priceFull || "--"}`;
  };

  const getImg = (item) => item.images?.[0] || assets.placeholder_food || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80";

  return (
    <section className="w-full bg-[#FAF8F5] py-10 md:py-16" id="ordering-menu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-[#C85A17] uppercase tracking-widest block mb-1">
              Explore Our Dishes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3B2B] tracking-tight">
              {selectedCategory === "All" ? "Full Menu" : `${selectedCategory} Dishes`}
            </h2>
          </div>
          <span className="text-xs font-semibold text-stone-500 bg-stone-200/70 px-3 py-1 rounded-full self-start sm:self-auto mt-2 sm:mt-0">
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"} available
          </span>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8">
            <svg className="w-12 h-12 mx-auto text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-base font-bold text-stone-700 mb-1">No dishes found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search or category tab to find what you are craving.
            </p>
          </div>
        ) : (
          /* Food Item Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((item) => {
              const defaultType = selectedTypeMap[item._id] || (item.types && item.types[0]?.label) || "Full";
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-stone-200/90 overflow-hidden hover:border-stone-300 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-stone-100">
                    <img
                      src={getImg(item)}
                      alt={`${item.name} at Majedaar Restaurant Ayodhya`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-stone-200 flex items-center gap-1.5 shadow-2xs">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                      <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item._id}`} className="hover:text-[#C85A17] transition-colors">
                        <h3 className="font-bold text-sm text-[#11261B] line-clamp-1 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-stone-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-extrabold text-[#1B3B2B] block">
                          {priceDisplay(item)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.types && item.types.length > 1 && (
                          <select
                            value={defaultType}
                            onChange={(e) =>
                              setSelectedTypeMap({
                                ...selectedTypeMap,
                                [item._id]: e.target.value,
                              })
                            }
                            className="text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-1 font-medium text-stone-700 focus:outline-none"
                          >
                            {item.types.map((t) => (
                              <option key={t.label} value={t.label}>
                                {t.label} (₹{t.price})
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => addToCart(item._id, defaultType)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1B3B2B] hover:bg-[#11261B] text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                        >
                          <span>ADD</span>
                          <span className="text-sm leading-none">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
