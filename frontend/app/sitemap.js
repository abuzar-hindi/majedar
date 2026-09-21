import { getPublicMenu } from "../lib/api/menu";

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://majedaar.com";
  const now = new Date();

  // Static public pages
  const staticPages = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/orderanddine`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/reserve-table`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faqs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic menu item pages
  let productPages = [];
  try {
    const menuItems = await getPublicMenu();
    if (Array.isArray(menuItems) && menuItems.length > 0) {
      productPages = menuItems
        .filter((item) => item && item._id && item.isAvailable !== false)
        .map((item) => ({
          url: `${siteUrl}/product/${item._id}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // If backend is unreachable during build or export, productPages will be empty
    // without failing the build.
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
