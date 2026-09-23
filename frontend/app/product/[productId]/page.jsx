import { getPublicMenuItem } from "../../../lib/api/menu";
import ProductDetailClient from "../../../components/ProductDetailClient";

export async function generateMetadata({ params }) {
  const { productId } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majedaar.com";

  try {
    const product = await getPublicMenuItem(productId);

    if (!product || !product.name) {
      return {
        title: "Dish Not Found | Majedaar Restaurant",
        description: "The requested dish or menu item could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${product.name} | Majedaar Restaurant, Ayodhya`;
    const description =
      product.description ||
      `Order fresh ${product.name} online from Majedaar Restaurant in Ayodhya. Prepared fresh with quality ingredients. Fast delivery & dine-in.`;

    const imageUrl =
      product.image?.url || product.images?.[0] || `${siteUrl}/brand/logo-full.png`;

    return {
      title,
      description,
      alternates: {
        canonical: `/product/${productId}`,
      },
      openGraph: {
        title,
        description,
        url: `/product/${productId}`,
        type: "article",
        images: [
          {
            url: imageUrl,
            alt: `${product.name} at Majedaar Restaurant`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Menu Item | Majedaar Restaurant, Ayodhya",
      description:
        "Order authentic dishes and freshly prepared meals from Majedaar Restaurant in Ayodhya.",
      alternates: {
        canonical: `/product/${productId}`,
      },
    };
  }
}

export default async function ProductPage({ params }) {
  const { productId } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majedaar.com";

  let product = null;
  try {
    product = await getPublicMenuItem(productId);
  } catch {
    product = null;
  }

  // Generate Product / Offer Schema.org structured data if product details exist
  let productJsonLd = null;
  if (product && product.name) {
    const isAvailable = product.isAvailable !== false;
    const availability = isAvailable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
    const imageUrl = product.image?.url || product.images?.[0];

    const offers = [];
    if (product.pricingType === "half-full") {
      if (product.halfPrice) {
        offers.push({
          "@type": "Offer",
          name: `${product.name} - Half Portion`,
          price: product.halfPrice,
          priceCurrency: "INR",
          availability,
          url: `${siteUrl}/product/${productId}`,
        });
      }
      if (product.fullPrice) {
        offers.push({
          "@type": "Offer",
          name: `${product.name} - Full Portion`,
          price: product.fullPrice,
          priceCurrency: "INR",
          availability,
          url: `${siteUrl}/product/${productId}`,
        });
      }
    } else if (product.price !== undefined) {
      offers.push({
        "@type": "Offer",
        price: product.price,
        priceCurrency: "INR",
        availability,
        url: `${siteUrl}/product/${productId}`,
      });
    }

    productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || product.name,
      image: imageUrl ? [imageUrl] : undefined,
      brand: {
        "@type": "Brand",
        name: "Majedaar Restaurant",
      },
      offers:
        offers.length === 1 ? offers[0] : offers.length > 1 ? offers : undefined,
    };

    // Only include real ratings from backend if available
    if (
      product.ratingSummary &&
      product.ratingSummary.reviewCount > 0 &&
      product.ratingSummary.averageRating
    ) {
      productJsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.ratingSummary.averageRating,
        reviewCount: product.ratingSummary.reviewCount,
      };
    }
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product} productId={productId} />
    </>
  );
}