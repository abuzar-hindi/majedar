import React from "react";

const LatestCollection = () => {
  const services = [
    {
      icon: "fa-mug-hot",
      title: "Great Coffee & Tea",
      description:
        "Freshly brewed coffee aur premium tea options, perfect for relaxing conversations and casual meetings.",
    },
    {
      icon: "fa-utensils",
      title: "Quality Dining Experience",
      description:
        "Breakfast, brunch, lunch, dinner aur desserts — har time ke liye delicious food, prepared by expert chefs.",
    },
    {
      icon: "fa-wifi",
      title: "Free Wi-Fi & Parking",
      description:
        "Free Wi-Fi, restroom facilities aur free parking lot — hassle-free experience from start to end.",
    },
    {
      icon: "fa-chair",
      title: "Comfortable Seating",
      description:
        "Outdoor seating, high chairs aur family-friendly setup — comfortable aur welcoming atmosphere.",
    },
  ];

  return (
    <div className="mb-10 pb-12 lg:pb-20" id="services">
      <div className="container mx-auto">
        {/* <div className="text-center mb-12">
          <h5 className="section-title font-secondary text-center text-primary font-normal mb-2">
            Services & Highlights
          </h5>
          <h1 className="mb-5 text-4xl font-bold">What We Offer</h1>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="w-full">
              <div className="service-item rounded p-12 bg-white">
                <i
                  className={`fa ${service.icon} text-4xl mb-4`}
                  style={{ color: "#FEA116" }}
                ></i>
                <h5 className="mb-3 font-semibold">{service.title}</h5>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestCollection;
