# Implementation Plan: Professional SEO for Majedaar Restaurant

Implement comprehensive technical and local SEO for **Majedaar Restaurant** (Ayodhya, Uttar Pradesh) using Next.js 14 App Router standards, strictly preserving the existing visual design, styling, and functionality.

## User Review Required

> [!IMPORTANT]
> **Zero Visual Regressions**: All SEO improvements (metadata, JSON-LD structured data, dynamic Open Graph, sitemap, robots, semantic markup, and internal crawl paths) operate behind-the-scenes. The existing UI layout, typography, Tailwind classes, and customer ordering flows remain completely unchanged.

> [!NOTE]
> **Base Domain Configuration**: We will configure `process.env.NEXT_PUBLIC_SITE_URL` with a fallback to `https://majedaar.com`. Real restaurant address, timings, and contact details from the verified codebase (Sahabganj / Ram Path, Ayodhya 224001, phone +91 7905404619) will be utilized for all local structured data.

---

## Proposed Changes

### 1. Global Metadata & Site Architecture
#### [MODIFY] [frontend/app/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/layout.jsx)
- Set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://majedaar.com')`.
- Configure title template: `default: "Majedaar Restaurant | Order Food Online in Ayodhya"`, `template: "%s | Majedaar Restaurant"`.
- Configure natural meta description emphasizing authentic Indian food, online delivery, and dining in Ayodhya / Faizabad.
- Add authors, creator, publisher, `formatDetection: { telephone: true }`.
- Set global Open Graph defaults (`og:site_name`, `og:locale`, `og:image`, `og:type: "website"`).
- Set Twitter card metadata (`summary_large_image`).
- Add global default `robots: { index: true, follow: true, ... }`.
- Inject root `schema.org/Restaurant` structured data script (truthful data: real address on Ram Path Sahabganj Ayodhya, real phone +91 7905404619, opening hours 11:00 AM - 11:30 PM, INR currency, real delivery zone info).

---

### 2. Robots.txt and XML Sitemap
#### [NEW] [frontend/app/robots.js](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/robots.js)
- Implement standard Next.js App Router robots configuration:
  - Allow `/` and all public static assets (`/_next/`, `/images/`, `/brand/`, `/assets/`).
  - Disallow private customer/transactional paths: `/cart`, `/place-order`, `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`, `/orders`, `/my-orders`, `/my-profile`, `/my-bookings`, `/api/`.
  - Reference sitemap: `${siteUrl}/sitemap.xml`.

#### [NEW] [frontend/app/sitemap.js](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/sitemap.js)
- Implement dynamic sitemap generation:
  - Add indexable public routes: `/`, `/orderanddine`, `/contact`, `/faqs`, `/help`, `/reserve-table`.
  - Fetch active menu items from backend API (`getPublicMenu()`).
  - Add dynamic entries for `/product/[productId]` with weekly change frequency and priority 0.8.
  - Graceful fallback: If backend is offline or empty during build, include all static public URLs without breaking the build.

---

### 3. Page-Specific Metadata & Indexability Strategy

#### Indexable Pages:
- **Home (`/`)**: Handled with root metadata defaults + Home page canonical alternates (`alternates: { canonical: "/" }`).
- **Menu (`/orderanddine`)**:
  #### [NEW] [frontend/app/orderanddine/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orderanddine/layout.jsx)
  - Title: `"Menu & Online Ordering | Fresh Food in Ayodhya"`
  - Description: `"Browse the full Majedaar Restaurant menu in Ayodhya. Order fresh Biryanis, Momos, South Indian, Chinese, Thalis, and Desserts online for fast delivery or dine-in."`
  - Canonical: `/orderanddine`
  - OpenGraph & Twitter metadata.
- **Contact (`/contact`)**:
  #### [MODIFY] [frontend/app/contact/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/contact/page.jsx)
  - Enhanced metadata with canonical `/contact`, Ayodhya location keywords, OpenGraph, and Twitter tags.
- **FAQs (`/faqs`)**:
  #### [NEW] [frontend/app/faqs/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/faqs/layout.jsx)
  - Title: `"Frequently Asked Questions | Ordering & Delivery in Ayodhya"`
  - Description: `"Find answers to common questions about ordering, payments, delivery zones in Ayodhya/Faizabad, dine-in, and table reservations at Majedaar Restaurant."`
  - Canonical: `/faqs`
  - `FAQPage` schema.org JSON-LD structured data with real questions and answers from the FAQ component.
- **Help (`/help`)**:
  #### [MODIFY] [frontend/app/help/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/help/page.jsx)
  - Title: `"Help & Customer Support"`
  - Description: `"Get customer support for orders, delivery inquiries, and assistance at Majedaar Restaurant in Ayodhya. Call or WhatsApp +91 7905404619."`
  - Canonical: `/help`
- **Reserve a Table (`/reserve-table`)**:
  #### [MODIFY] [frontend/app/reserve-table/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/reserve-table/page.jsx)
  - Title: `"Reserve a Table | Dine-in Booking in Ayodhya"`
  - Canonical: `/reserve-table`

#### Dynamic Product Route:
- **Product (`/product/[productId]`)**:
  #### [MODIFY] [frontend/app/product/[productId]/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/product/%5BproductId%5D/page.jsx)
  #### [NEW] [frontend/components/ProductDetailClient.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/components/ProductDetailClient.jsx)
  - Convert `page.jsx` to a Server Component that implements `generateMetadata({ params })`.
  - Fetch item via `getPublicMenuItem(productId)`:
    - Title: `"${item.name} | Majedaar Restaurant, Ayodhya"`
    - Description: Item's authentic description from backend.
    - OpenGraph: Item name, description, item image.
    - Canonical: `/product/${productId}`.
  - Render `schema.org/Product` + `Offer` structured data (truthful price, INR currency, availability status, handling both single and half/full pricing accurately without misleading pricing).
  - Pass initial product data to `ProductDetailClient.jsx` preserving all interactive client state (variant selection, addToCart, related products) with zero UI change.

#### Private Pages Marked `noindex, nofollow`:
Create or update route layouts or page metadata for all private routes:
- `/login` -> [frontend/app/login/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/login/layout.jsx) (`noindex, nofollow`)
- `/signup` -> [frontend/app/signup/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/signup/layout.jsx) (`noindex, nofollow`)
- `/verify-email` -> [frontend/app/verify-email/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/verify-email/layout.jsx) (`noindex, nofollow`)
- `/forgot-password` -> [frontend/app/forgot-password/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/forgot-password/layout.jsx) (`noindex, nofollow`)
- `/reset-password` -> [frontend/app/reset-password/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/reset-password/layout.jsx) (`noindex, nofollow`)
- `/cart` -> [frontend/app/cart/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/cart/layout.jsx) (`noindex, nofollow`)
- `/place-order` -> [frontend/app/place-order/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/place-order/layout.jsx) (`noindex, nofollow`)
- `/orders` -> [frontend/app/orders/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orders/layout.jsx) (`noindex, nofollow`)
- `/my-orders` -> [frontend/app/my-orders/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-orders/layout.jsx) (`noindex, nofollow`)
- `/my-profile` -> [frontend/app/my-profile/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-profile/layout.jsx) (`noindex, nofollow`)
- `/my-bookings` -> [frontend/app/my-bookings/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-bookings/layout.jsx) (`noindex, nofollow`)

---

### 4. Semantic Internal Linking & Discoverability
#### [MODIFY] [frontend/components/Footer.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/components/Footer.jsx)
- Add natural navigation links to FAQs, Help & Support, and Reserve a Table within Quick Links without altering visual style.
#### [MODIFY] [frontend/app/orderanddine/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orderanddine/page.jsx) & [frontend/components/MenuPreview.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/components/MenuPreview.jsx)
- Wrap dish names/images in clean `<Link href={`/product/${item._id}`}>` anchor tags so search engine crawlers can seamlessly index individual dish pages from the menu.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` in `frontend` to verify 0 warnings or errors.
- Run `npm run build` in `frontend` to verify full compilation, static generation of routes, sitemap.xml, robots.txt, and dynamic route checks.

### Verification of Generated Outputs
- Verify `/robots.txt` output via browser or curl: check Allow rules, Disallow rules on private paths, Sitemap reference.
- Verify `/sitemap.xml` output: check canonical public URLs and structure.
- Verify HTML `<head>` tags on key routes (`/`, `/orderanddine`, `/contact`, `/faqs`, `/help`, `/product/[id]`, `/login`, `/cart`):
  - Check unique titles and descriptions.
  - Check canonical `<link rel="canonical" href="...">`.
  - Check robots directives (`index, follow` vs `noindex, nofollow`).
  - Check Open Graph (`og:title`, `og:description`, `og:image`, `og:url`).
  - Check JSON-LD structured data syntax and content validity.
