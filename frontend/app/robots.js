export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majedaar.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/place-order",
          "/login",
          "/signup",
          "/verify-email",
          "/forgot-password",
          "/reset-password",
          "/my-orders",
          "/my-orders/*",
          "/orders",
          "/my-profile",
          "/my-bookings",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
