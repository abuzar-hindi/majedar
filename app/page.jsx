"use client";
import { useState } from "react";
import Hero from "../components/Hero";
import BestsellerSection from "../components/BestsellerSection";
import CategoryNav from "../components/CategoryNav";
import MenuPreview from "../components/MenuPreview";
import RestaurantStory from "../components/RestaurantStory";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Hero />
      <BestsellerSection />
      <CategoryNav activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <MenuPreview selectedCategory={activeCategory} />
      <RestaurantStory />
    </div>
  );
}
