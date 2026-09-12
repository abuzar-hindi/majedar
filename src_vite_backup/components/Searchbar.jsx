import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import { useLocation } from "react-router-dom";

const Searchbar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("orderanddine") || location.pathname === "/") {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location.pathname]);

  return showSearch && visible ? (
    <div className="bg-[#FAF8F5] border-b border-stone-200 py-3 px-4 transition-all">
      <div className="max-w-xl mx-auto flex items-center gap-3">
        <div className="relative flex-1 flex items-center">
          <svg className="w-4 h-4 absolute left-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-white text-stone-800 text-xs sm:text-sm placeholder-stone-400 border border-stone-200 rounded-full shadow-2xs focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-all"
            type="text"
            placeholder="Search dishes, cuisines..."
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setShowSearch(false)}
          className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;
};

export default Searchbar;
