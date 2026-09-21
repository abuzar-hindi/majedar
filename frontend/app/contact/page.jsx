import NewsLetter from "../../components/NewsLetter";
import Logo from "../../components/Logo";

export const metadata = {
  title: "Contact & Location | Ayodhya Restaurant",
  description:
    "Visit Majedaar Restaurant in Ayodhya, Uttar Pradesh on Ram Path, Sahabganj for dine-in, takeaway, and fast home delivery. Call +91 7905404619.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Location | Majedaar Restaurant, Ayodhya",
    description:
      "Find location, phone number, and directions for Majedaar Restaurant on Ram Path, Sahabganj, Ayodhya.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact & Location | Majedaar Restaurant, Ayodhya",
    description:
      "Find location, phone number, and directions for Majedaar Restaurant on Ram Path, Sahabganj, Ayodhya.",
  },
};

export default function Contact() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10">
      <div className="text-center pb-6">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1B3B2B]">
          Contact &amp; Location
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Information Card */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center mb-3">
                <Logo variant="full" className="h-9 w-auto" />
              </div>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                Visit us or place your order online for fresh, delicious food.
              </p>
              <div className="space-y-4 border-t border-b border-stone-100 py-6 my-6 text-sm">
                <div>
                  <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">
                    Address &amp; Location
                  </h3>
                  <p className="text-stone-600 leading-snug">
                    Ram Path, Sahabganj - Vaidehi Nagar Rd, Faizabad, Uttar Pradesh 224001
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">
                    Contact &amp; Direct Orders
                  </h3>
                  <p className="text-stone-600">
                    Phone:{" "}
                    <a href="tel:+917905404619" className="text-[#C85A17] font-bold hover:underline">
                      +91 7905404619
                    </a>
                  </p>
                  <p className="text-stone-600">
                    Email:{" "}
                    <a href="mailto:majedaarrestaurant@gmail.com" className="text-[#C85A17] hover:underline">
                      majedarrestaurant@gmail.com
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Services Offered</h3>
                  <p className="text-stone-600">Dine-in, Takeaway &amp; Express Delivery</p>
                  <p className="text-xs text-stone-400 mt-0.5">Contact us directly for party &amp; catering orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs min-h-[380px] flex">
            <iframe
              title="Majedaar Restaurant Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3561.7933502857018!2d82.1624034!3d26.7828564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a0789b0e94f05%3A0x619cbb945e3eb1eb!2sMajedaar%20Restaurant%20%26%20Cafe!5e0!3m2!1sen!2sin!4v1789186134650!5m2!1sen!2sin"
              className="w-full h-full min-h-[380px] border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <NewsLetter />

      {/* Large Brand Section Above Footer */}
      <section className="w-full pt-16 pb-12 sm:pt-24 sm:pb-16 border-t border-stone-200/80 bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full flex flex-col items-center text-center">
          <Logo
            variant="full"
            className="w-56 sm:w-72 md:w-96 max-w-full h-auto"
            alt="Majedaar Restaurant Brand"
          />
        </div>
      </section>
    </div>
  );
}
