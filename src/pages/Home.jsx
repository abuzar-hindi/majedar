import React, { useState } from "react";
import Hero from "../components/Hero";
import SearchSection from "../components/SearchSection";
import BestsellerSection from "../components/BestsellerSection";
import CategoryNav from "../components/CategoryNav";
import MenuPreview from "../components/MenuPreview";
import RestaurantStory from "../components/RestaurantStory";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* 1. Hero / Restaurant Intro */}
      <Hero />

      {/* 2. Compact Search */}
      <SearchSection />

      {/* 3. Bestsellers ("What people love") */}
      <BestsellerSection />

      {/* 4. Circular Food Categories */}
      <CategoryNav
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* 5. Small Menu Preview */}
      <MenuPreview selectedCategory={activeCategory} />

      {/* 6. Restaurant Story */}
      <RestaurantStory />
    </main>
  );
};

export default Home;
