import Link from "next/link";

const RestaurantStory = () => {
  return (
    <section className="w-full bg-[#F2F7F4] py-14 sm:py-20 border-b border-stone-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B] tracking-tight mb-6">
          Authentic Cooking, Prepared Fresh Daily
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          At Majedar Restaurant, We take pride in serving genuine flavors{" "}
          <b>straight to your table or doorstep</b>. Our chefs prepare each meal with love and attention to
          detail, <i>ensuring that every bite is a celebration of taste</i>. Experience the essence of
          traditional cooking, made fresh for you every day.
        </p>
        <div className="flex justify-center gap-6 text-xs sm:text-sm font-semibold text-[#1B3B2B]">
          {["Order", "Eat", "Enjoy"].map((word) => (
            <div key={word} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C85A17]"></span>
              <span>{word}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantStory;
