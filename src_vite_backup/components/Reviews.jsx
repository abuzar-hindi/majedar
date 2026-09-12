const Reviews = () => {
  const reviews = [
    {
      name: "Rajesh Kumar",
      profession: "Local Business Owner",
      text: "Excellent food and great service! The ambiance is perfect for family dinners. Highly recommended!",
      image: "/images/testimonial-1.jpg",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      profession: "Teacher",
      text: "The best restaurant in Faizabad! The rooftop seating is amazing, and the food quality is outstanding.",
      image: "/images/testimonial-2.jpg",
      rating: 5,
    },
    {
      name: "Amit Singh",
      profession: "Software Engineer",
      text: "Great place to watch sports while enjoying delicious food. The staff is very friendly and attentive.",
      image: "/images/testimonial-3.jpg",
      rating: 5,
    },
  ];

  return (
    <div className="py-12 lg:py-12 px-4 lg:px-12" id="reviews">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h5 className="section-title font-secondary text-center text-primary font-normal mb-2">
            Reviews
          </h5>
          <h1 className="mb-5 text-4xl font-bold">
            Our <i className="text-orange-500">Customers</i> Say
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="w-full">
              <div className="testimonial-item bg-white border-2 border-gray-200 rounded p-6 h-full transition-all duration-500 hover:border-orange-300">
                <i className="fa fa-quote-left text-2xl text-primary mb-3"></i>
                <div className="mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <i key={i} className="fa fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">{review.text}</p>
                <div className="flex items-center">
                  <img
                    className="flex-shrink-0 w-12 h-12 object-cover rounded-full"
                    src={review.image}
                    alt={review.name}
                  />
                  <div className="pl-3">
                    <h5 className="mb-1 font-semibold">{review.name}</h5>
                    <small className="text-gray-600">{review.profession}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
