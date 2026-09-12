const Gallery = () => {
  const galleryImages = [
    "/images/gallery/menu-1.webp",
    "/images/gallery/menu-2.jpg",
    "/images/gallery/menu-3.webp",
    "/images/gallery/menu-4.jpg",
    "/images/gallery/menu-5.webp",
    "/images/gallery/menu-6.jpg",
    "/images/gallery/menu-7.webp",
    "/images/gallery/menu-8.webp",
    "/images/gallery/menu-9.jpg",
  ];

  return (
    <div className="py-12 px-4 lg:px-12 lg:py-12" id="gallery">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h5 className="section-title font-secondary text-center text-primary font-normal mb-2">
            Our Gallery
          </h5>
          <h1 className="mb-5 text-4xl font-bold">Food & Ambiance</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div key={index} className="w-full">
              <div className="gallery-item">
                <img
                  className="w-full h-72 object-cover"
                  src={image}
                  alt={`Gallery ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
