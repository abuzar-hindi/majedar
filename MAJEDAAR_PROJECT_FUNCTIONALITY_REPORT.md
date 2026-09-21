# PROJECT FUNCTIONALITY & SYSTEM REPORT
## Majedaar Restaurant

**Project Name:** Majedaar Restaurant & Cafe  
**Location:** Ram Path, Sahabganj - Vaidehi Nagar Rd, Faizabad, Ayodhya, Uttar Pradesh 224001, India  
**Report Type:** Complete Codebase Functionality, Architecture, Security & Implementation Audit  
**Scope:** Customer Frontend (`/frontend`), Admin Panel (`/admin`), Backend Service (`/backend`)  
**Audit Date:** September 20, 2026  
**Operating Mode:** Read-Only Code Inspection (Zero modifications made)

---

## 1. PROJECT OVERVIEW

### Overall Architecture
Majedaar Restaurant is architected as a modular, three-tier monorepo consisting of:
1. **Customer-Facing Web Application (`/frontend`)**: A modern, mobile-responsive web storefront built with Next.js (App Router) delivering discovery, menu browsing, cart management, address capture, online/COD checkout, order tracking, item-level ratings, and account lifecycle management.
2. **Management Office & Administration Application (`/admin`)**: A purpose-built dashboard for restaurant managers and kitchen operators, handling incoming orders, live kitchen status transitions, payment audit logs, Razorpay refunds, menu catalog & variant pricing, delivery zones, customer feedback, and Web Push notifications.
3. **Core REST API & Business Logic Service (`/backend`)**: A centralized Node.js / Express service interfacing with MongoDB via Mongoose. It is the sole authoritative source of truth for pricing calculations, GST, tiered delivery fees, order states, cryptographic Razorpay payment verification, webhook ingestion, customer authentication, and background Web Push alerts.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           MAJEDAAR SYSTEM TOPOLOGY                             │
└────────────────────────────────────────────────────────────────────────────────┘

    ┌───────────────────────────┐           ┌───────────────────────────┐
    │     Customer Storefront   │           │     Admin Office Panel    │
    │         (/frontend)       │           │          (/admin)         │
    │   Next.js 14 / React 18   │           │   Next.js 16 / React 19   │
    │   Tailwind CSS v3         │           │   Tailwind CSS v4         │
    └─────────────┬─────────────┘           └─────────────┬─────────────┘
                  │                                       │
                  │ HTTPS / JSON / Cookies                │ HTTPS / JSON / Cookies
                  │ (customer_token)                      │ (token)
                  ▼                                       ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │                      Core Backend API (/backend)                  │
    │              Node.js (>=20) • Express 5 • Mongoose 8              │
    ├───────────────────────────────────────────────────────────────────┤
    │  • Auth & RBAC Middleware          • Rate Limiters (express-limit)│
    │  • Authoritative Pricing & GST     • Zod Schema Validators        │
    │  • Order State Machine             • Cloudinary Image Storage     │
    │  • Cryptographic Razorpay Service  • Resend Email OTP Service     │
    │  • Razorpay Webhook (Raw HMAC)     • Web Push / VAPID Service     │
    └──────────────┬───────────────────────────────────┬────────────────┘
                   │                                   │
                   ▼                                   ▼
    ┌───────────────────────────────┐   ┌───────────────────────────────┐
    │      MongoDB Database         │   │       External Services       │
    │  (Orders, Payments, Menu,     │   │  • Razorpay (Checkout/Refunds)│
    │   Customers, Reviews, Zones,  │   │  • Cloudinary (Media Assets)  │
    │   Admins, Messages, Otp, Push)│   │  • Resend (Email Verification)│
    └───────────────────────────────┘   └───────────────────────────────┘
```

### Applications and Services Present

| Service / Directory | Technology Stack | Port / Runtime | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend** (`/backend`) | Node.js (>=20), Express 5.2.1, Mongoose 8.12.1, MongoDB, Zod 4.6, Razorpay SDK, Resend, web-push | Default: `http://localhost:5000` (`PORT=5000`) | Authoritative business logic, database persistence, cryptographic signature checking, webhooks, admin notifications, OTP generation. |
| **Customer Web** (`/frontend`) | Next.js 14.2.18 (App Router), React 18.3.1, Tailwind CSS 3.4.17, react-toastify, qrcode | Default: `http://localhost:3000` | Customer-facing website, SEO landing, interactive menu, cart, checkout with Razorpay/COD, order history, ratings. |
| **Admin Panel** (`/admin`) | Next.js 16.3.5 (App Router), React 19.2.8, Tailwind CSS 4, Service Worker | Default: `http://localhost:3001` | Operations dashboard, order fulfillment, delivery zone setup, catalog editing, refund control, push notifications. |

### Inter-Application Communication
- **Frontend to Backend**: Communicates over HTTP via `fetch` wrapped in `frontend/lib/api/client.js`. Credentials are transmitted automatically via standard browser cookies (`credentials: "include"`). Customer sessions use the `customer_token` cookie.
- **Admin to Backend**: Communicates over HTTP via `fetch` wrapped in `admin/lib/api/client.js` with `credentials: "include"`. Admin sessions use the `token` cookie.
- **Backend to External Providers**:
  - **Razorpay**: Direct REST communication via Razorpay Node SDK using `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Incoming webhooks hit `/api/payments/razorpay/webhook` with raw request body verification using `RAZORPAY_WEBHOOK_SECRET`.
  - **Cloudinary**: Direct buffer uploads via `cloudinary.uploader.upload_stream` using Cloudinary v2 SDK.
  - **Resend**: Transactional email dispatch for 6-digit verification and password reset OTPs.
  - **Web Push**: VAPID protocol messages sent via `web-push` to browser notification gateways.

---

## 2. CUSTOMER WEBSITE

### Route Inventory & Detailed Specifications

#### 1. Home (`/`)
- **File:** [frontend/app/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/page.jsx)
- **Purpose:** Public storefront landing page for brand storytelling, featured bestseller dishes, category navigation, and direct order entry.
- **Main Functionality:**
  - `Hero` component with primary CTA to explore the menu.
  - `BestsellerSection` showcasing high-volume dishes with quick-add functionality.
  - `CategoryNav` pill switcher for browsing cuisines.
  - `MenuPreview` listing dishes by category with veg/non-veg indicators and pricing.
  - `RestaurantStory` explaining culinary heritage in Ayodhya.
- **APIs Used:** `GET /api/menu`, `GET /api/categories` (via `ShopContext`).
- **Authentication Requirements:** None (Public).
- **Payment / Order Dependencies:** Adding items modifies client cart state (`localStorage`).

#### 2. Menu / Order & Dine (`/orderanddine`)
- **File:** [frontend/app/orderanddine/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orderanddine/page.jsx)
- **Layout & SEO:** [frontend/app/orderanddine/layout.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orderanddine/layout.jsx)
- **Purpose:** Full interactive digital restaurant menu.
- **Main Functionality:**
  - Sticky horizontal category bar dynamically generated from backend categories.
  - Real-time client-side search filtering by item name, description, and cuisine.
  - Dish cards displaying image, veg/non-veg status, bestseller badge, availability overlay ("Currently Unavailable").
  - Portion variant switcher (Single vs. Half/Full pricing toggle).
  - Add to Order button with quantity handling.
- **APIs Used:** `GET /api/menu`, `GET /api/categories`.
- **Authentication Requirements:** None (Public).
- **Payment / Order Dependencies:** Feeds items into `ShopContext`.

#### 3. Product / Dish Detail (`/product/[productId]`)
- **File:** [frontend/app/product/[productId]/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/product/%5BproductId%5D/page.jsx)
- **Component:** [frontend/components/ProductDetailClient.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/components/ProductDetailClient.jsx)
- **Purpose:** Dedicated deep-dive page for an individual dish.
- **Main Functionality:**
  - Displays high-resolution dish image, category, veg badge, full description.
  - Portion variant selection (Half / Full / Single) updating active unit price.
  - Incremental quantity picker before adding to cart.
  - Customer review summary and star ratings fetched from backend.
  - Dynamic SEO metadata generation and Schema.org `Product` / `Offer` JSON-LD injection.
- **APIs Used:** `GET /api/menu/:id`, `GET /api/menu/:menuItemId/reviews`.
- **Authentication Requirements:** None (Public).
- **Payment / Order Dependencies:** Populates `ShopContext`.

#### 4. Cart (`/cart`)
- **File:** [frontend/app/cart/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/cart/page.jsx)
- **Purpose:** Cart inspection and order preparation.
- **Main Functionality:**
  - Lists all selected items with variant snapshots (`single`, `half`, `full`).
  - Incremental `+` and `-` quantity controls; item removal.
  - Real-time price calculation using current catalog prices.
  - Minimum order enforcement: displays warning if subtotal is below ₹100 and disables checkout button.
  - `CartTotal` breakdown: Subtotal, 5% GST estimate, Tiered Delivery Fee estimate, Total.
  - "Proceed to Checkout" button routing to `/place-order`.
- **APIs Used:** None directly (synchronizes with `ShopContext` state and local storage).
- **Authentication Requirements:** None to view; authentication enforced upon proceeding to checkout.
- **Payment / Order Dependencies:** Direct prerequisite for `/place-order`.

#### 5. Checkout / Place Order (`/place-order`)
- **File:** [frontend/app/place-order/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/place-order/page.jsx)
- **Purpose:** Final delivery details entry, zone selection, payment selection, and order submission.
- **Main Functionality:**
  - Auto-fills registered customer name, email, and phone.
  - Delivery address input: street address, landmark, area.
  - Predefined delivery instructions dropdown ("Call on arrival", "Leave at the gate", "Don't ring the bell", "Other").
  - Delivery Zone selector grouped into Tier 1 (0–3 km: ₹15) and Tier 2 (3–5 km: ₹30).
  - Payment method toggle: Cash on Delivery (COD) vs. Online Payment (Razorpay).
  - Invokes `POST /api/orders` to persist order.
  - If Online selected: immediately requests Razorpay payment order (`POST /api/payments/razorpay/create`), launches Razorpay Checkout modal, and verifies signature upon completion (`POST /api/payments/razorpay/verify`).
- **APIs Used:** `GET /api/delivery-zones`, `POST /api/orders`, `POST /api/payments/razorpay/create`, `POST /api/payments/razorpay/verify`.
- **Authentication Requirements:** **Mandatory** (`customer_token` cookie required; redirects to `/login?redirect=/place-order`).
- **Payment / Order Dependencies:** Core transaction gateway for the entire customer journey.

#### 6. My Orders (`/my-orders`)
- **File:** [frontend/app/my-orders/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-orders/page.jsx)
- **Purpose:** Customer's chronological order history.
- **Main Functionality:**
  - Lists all orders placed by authenticated customer sorted newest first.
  - Displays Order ID/Number (`#MD-YYMMDD-XXXXXX`), date, items, total amount.
  - Order status badge (`placed`, `preparing`, `completed`, `cancelled`).
  - Payment status badge (`pending`, `paid`, `failed`, `refunded`).
  - Contextual "Pay Online" / "Pay Now" action buttons for unpaid orders.
  - Direct link to individual receipt details via `/my-orders/[id]`.
- **APIs Used:** `GET /api/orders/my`.
- **Authentication Requirements:** **Mandatory**.
- **Payment / Order Dependencies:** Read-only view of customer orders.

#### 7. Order Details & Receipt (`/my-orders/[id]`)
- **File:** [frontend/app/my-orders/[id]/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-orders/%5Bid%5D/page.jsx)
- **Purpose:** Comprehensive receipt, live fulfillment tracker, payment recovery, and food rating.
- **Main Functionality:**
  - Visual timeline tracker: Step 1 (Placed) → Step 2 (Kitchen Preparing) → Step 3 (Completed).
  - Itemized breakdown with name, portion variant, quantity, unit price, item subtotal.
  - Financial summary: Subtotal, 5% GST, Delivery Fee, Total.
  - Delivery address card with phone, landmark, instructions.
  - **Online Payment Recovery / Retry**: If an order was placed as COD or online payment failed/dismissed, customer can click "Pay Online" / "Pay Now". Initiates `POST /api/payments/razorpay/retry/:orderId`, re-launches Razorpay, verifies signature, and transitions order to Paid.
  - **Star Rating System**: For completed orders (`orderStatus === 'completed'`), unlocks interactive 1–5 star rating buttons per item. Submits rating to `POST /api/reviews`.
- **APIs Used:** `GET /api/orders/:id`, `POST /api/payments/razorpay/retry/:orderId`, `POST /api/payments/razorpay/verify`, `POST /api/reviews`.
- **Authentication Requirements:** **Mandatory** (strict ownership check enforced on backend).
- **Payment / Order Dependencies:** Supports in-flight and post-order payment settlements.

#### 8. Legacy Orders Route (`/orders`)
- **File:** [frontend/app/orders/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/orders/page.jsx)
- **Purpose:** Backwards-compatible route redirect.
- **Main Functionality:** Automatically issues a client-side router redirect to `/my-orders`.
- **Authentication Requirements:** None (redirects).

#### 9. Table Bookings Info (`/my-bookings`)
- **File:** [frontend/app/my-bookings/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-bookings/page.jsx)
- **Purpose:** Customer dine-in reservation informational page.
- **Main Functionality:** Informs customer that digital reservations are in development and displays direct restaurant call links (`tel:+917905404619`).
- **APIs Used:** None.
- **Authentication Requirements:** None.

#### 10. Reserve a Table (`/reserve-table`)
- **File:** [frontend/app/reserve-table/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/reserve-table/page.jsx)
- **Component:** [frontend/components/ReserveTable.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/components/ReserveTable.jsx)
- **Purpose:** Table reservation page with SEO metadata.
- **Main Functionality:** Call-to-action to reserve dining tables via direct restaurant telephone line.
- **APIs Used:** None.
- **Authentication Requirements:** None.

#### 11. Customer Profile (`/my-profile`)
- **File:** [frontend/app/my-profile/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/my-profile/page.jsx)
- **Purpose:** Customer account details.
- **Main Functionality:**
  - Displays registered Name, Email, Phone number, Email verification status.
  - Avatar badge generated from initials.
  - Links to `/my-orders`, `/forgot-password`, and Sign Out button.
  - *Note:* Profile editing (editing name/phone) is NOT implemented; fields are display-only.
- **APIs Used:** `GET /api/customer-auth/me` (via `AuthContext`).
- **Authentication Requirements:** **Mandatory**.

#### 12. Contact & Location (`/contact`)
- **File:** [frontend/app/contact/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/contact/page.jsx)
- **Purpose:** Restaurant contact information, physical location, opening hours, interactive map, and customer feedback submission.
- **Main Functionality:**
  - Address details, telephone link, email link, opening hours (11:00 AM – 11:30 PM).
  - Embedded interactive Google Map iframe for Ram Path, Sahabganj location.
  - Integrates `NewsLetter` component: authenticated feedback form allowing customers to submit Complaints, Suggestions, or Queries.
- **APIs Used:** `POST /api/contact` (via `NewsLetter.jsx`).
- **Authentication Requirements:** Public for reading; feedback submission requires authenticated customer session.

#### 13. Help & Customer Support (`/help`)
- **File:** [frontend/app/help/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/help/page.jsx)
- **Purpose:** Immediate assistance hub for customer support.
- **Main Functionality:**
  - Direct contact links: Call Us (`tel:+917905404619`), WhatsApp (`https://wa.me/917905404619`), Email (`majedarrestaurant@gmail.com`).
  - Structured issue selector ("Wrong item delivered", "Order too late or not delivered", "Payment deducted but order not placed", "Need to cancel an order", "Food quality complaint") that generates pre-filled WhatsApp inquiry links.
- **APIs Used:** None (External protocol links).
- **Authentication Requirements:** None (Public).

#### 14. FAQs (`/faqs`)
- **File:** [frontend/app/faqs/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/faqs/page.jsx)
- **Purpose:** Self-service question-and-answer repository.
- **Main Functionality:**
  - Accordion dropdowns organized by Ordering, Payment, Delivery, Dine-in & Table Booking, Cancellation & Refunds, Timings.
  - Visual Payment Method Grid highlighting UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, Net Banking, Wallets, and COD.
  - Razorpay PCI-DSS security badges.
- **APIs Used:** None.
- **Authentication Requirements:** None (Public).

#### 15. Sign In (`/login`)
- **File:** [frontend/app/login/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/login/page.jsx)
- **Purpose:** Customer login portal.
- **Main Functionality:** Email and password authentication with rate-limited submission. On success, sets `customer_token` HttpOnly cookie and redirects to destination.
- **APIs Used:** `POST /api/customer-auth/login`.

#### 16. Sign Up (`/signup`)
- **File:** [frontend/app/signup/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/signup/page.jsx)
- **Purpose:** Customer account registration.
- **Main Functionality:** Captures name, email, phone, password. Triggers 6-digit email OTP generation and redirects to `/verify-email`.
- **APIs Used:** `POST /api/customer-auth/signup`.

#### 17. Email Verification (`/verify-email`)
- **File:** [frontend/app/verify-email/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/verify-email/page.jsx)
- **Purpose:** Complete signup via 6-digit OTP verification.
- **Main Functionality:** Validates OTP, activates customer account (`emailVerified: true`), establishes authenticated session cookie, and provides 60-second cooldown OTP resend button.
- **APIs Used:** `POST /api/customer-auth/verify-email`, `POST /api/customer-auth/resend-otp`.

#### 18. Forgot Password (`/forgot-password`) & Reset Password (`/reset-password`)
- **Files:** [frontend/app/forgot-password/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/forgot-password/page.jsx), [frontend/app/reset-password/page.jsx](file:///c:/Users/ziddi/Desktop/majedaar/frontend/app/reset-password/page.jsx)
- **Purpose:** Account recovery.
- **Main Functionality:** Dispatches password reset OTP via Resend email, validates code, resets password hash with bcrypt, and invalidates prior JWT sessions via `tokenVersion` increment.
- **APIs Used:** `POST /api/customer-auth/forgot-password`, `POST /api/customer-auth/reset-password`.

---

## 3. CUSTOMER ORDER FLOW

### Complete Order Lifecycle
```
[Menu / Browse] ──► [Select Portion / Variant] ──► [Add to Cart]
                                                          │
                                                          ▼
[Place Order Screen] ◄── [Check Minimum ₹100] ◄── [Cart Review]
        │
        ├──────────────────────────────────────┬──────────────────────────────────┐
        ▼                                      ▼                                  ▼
[Zone Selection]                       [Address & Phone]                 [Delivery Instructions]
(0-3km: ₹15 / 3-5km: ₹30)                                                (Call/Gate/Bell/Other)
        │
        ▼
[Payment Method Decision]
        │
        ├─────────────────────────────────────────────────┐
        ▼ (COD)                                           ▼ (Online)
[POST /api/orders]                                [POST /api/orders]
(orderStatus: placed,                              (orderStatus: placed,
 paymentStatus: pending)                           paymentStatus: pending)
        │                                                 │
        │                                                 ▼
        │                                         [POST /api/payments/razorpay/create]
        │                                         (Creates Razorpay Order & PaymentAttempt)
        │                                                 │
        │                                                 ▼
        │                                         [Razorpay Modal UI]
        │                                                 │
        │                                ┌────────────────┴────────────────┐
        │                                ▼ (Success)                       ▼ (Dismiss / Fail)
        │                     [POST /payments/verify]           [Saved as Pending Payment]
        │                     (Signature HMAC verified,         (Customer can retry later
        │                      paymentStatus: paid)              via Pay Now on My Orders)
        │                                │                                 │
        └────────────────────────────────┴─────────────────────────────────┘
                                         │
                                         ▼
                               [Order Confirmed]
                        (Admin Web Push Triggered)
                                         │
                                         ▼
                             [Restaurant Processing]
                        (orderStatus: placed ──► preparing)
                                         │
                                         ▼
                             [Delivery / Fulfillment]
                     (Admin shares order via WhatsApp to driver)
                                         │
                                         ▼
                               [Order Completed]
                        (orderStatus: completed)
                                         │
                                         ▼
                              [Customer Ratings]
                    (Item-level 1–5 star reviews unlocked)
```

### Actual Status Values Enforced by the Code
The backend database models strictly enforce the following status values via Mongoose enums:

1. **`orderStatus`** (on `Order` model):
   - `'placed'`: Initial state when order is created in database.
   - `'preparing'`: Kitchen has accepted and is preparing dishes.
   - `'completed'`: Food fulfilled and delivered to customer.
   - `'cancelled'`: Order rejected or cancelled by admin.
2. **`paymentStatus`** (on `Order` and `PaymentAttempt` models):
   - `'pending'`: Order created; payment not yet collected or settled.
   - `'paid'`: Authoritatively verified via Razorpay HMAC signature or webhook capture, or marked as collected COD by admin.
   - `'failed'`: Razorpay payment transaction failed or signature check failed.
   - `'refunded'`: Payment reversed via Razorpay API by admin.

### Detailed Mechanism Breakdown
- **Cart Behaviour:** Cart items are serialized in the browser's `localStorage` under key `cartItems`. Keys are composite tokens: `${itemId}__${variant}` (e.g. `65f8a...__half` or `65f8a...__single`). This guarantees portion-level isolation.
- **Quantity Handling:** Quantities are strictly positive integers. Decrementing to 0 automatically deletes the item key. Availability is checked when adding and during cart render; unavailable items trigger warning banners and cannot be checked out.
- **Authoritative Pricing:** While the frontend displays estimated totals, the backend **completely ignores client-submitted item prices**. In `order.service.js`, the server re-queries MongoDB for every `menuItem`, validates pricing type (`single` vs `half-full`), assigns authoritative database prices, and calculates subtotal.
- **Delivery Charges:** Delivery fee is strictly determined by active `DeliveryZone` records in the database:
  - **Tier 1 (0–3 km):** Fixed at ₹15.
  - **Tier 2 (3–5 km):** Fixed at ₹30.
  - Delivery beyond 5 km is rejected by the server.
- **GST Calculation:** The backend calculates 5.0% GST strictly on the items subtotal: `gst = Math.round(subtotal * 0.05 * 100) / 100`. Delivery fee is excluded from tax calculation.
- **Minimum Order Rule:** Both frontend and backend strictly enforce a minimum food subtotal of **₹100** (`subtotal < restaurantConfig.minimumOrderAmount`). Orders below ₹100 are rejected with `BadRequestError`.
- **Order Number Generation:** Every order receives a unique human-readable tracking number: `#MD-YYMMDD-XXXXXX` (e.g., `#MD-260920-A19F4B`), generated by [backend/src/utils/generate-order-number.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/utils/generate-order-number.js).
- **COD (Cash on Delivery):** Order is created with `paymentMethod: 'cod'`, `paymentStatus: 'pending'`, `orderStatus: 'placed'`. Customer cart is cleared immediately and customer is redirected to receipt page.
- **Online Payment (Razorpay):** Order is created first in MongoDB, then a Razorpay order is initialized for the exact order total in paise. Razorpay Checkout modal handles card/UPI/net banking. Signature is verified on backend before updating `paymentStatus: 'paid'`.
- **Order Tracking:** Real-time visual timeline tracker on `/my-orders/[id]` reflects `orderStatus`.
- **Order History:** Full order log retrievable at `/my-orders`.
- **Re-Order Feature:** ❌ **NOT IMPLEMENTED**. No "Re-Order" button or quick clone API exists.
- **Customer Cancellation:** ❌ **NOT IMPLEMENTED IN CODE**. The FAQ mentions a 5-minute WhatsApp window, but the customer web app and customer API provide no cancellation endpoint or button.
- **Order Issue Reporting:** Customers report issues via the WhatsApp links on `/help` or through the general feedback form on `/contact` (`POST /api/contact`).
- **Error Handling:** Centralized Express error handler formats errors as `{ success: false, message, errors }`. Frontend uses `react-toastify` for real-time customer feedback.

---

## 4. PAYMENT SYSTEM

### Payment Architecture Overview
The payment infrastructure uses a **multi-attempt audit model** backed by Razorpay. An application order has a 1-to-many relationship with `PaymentAttempt` records.

```
       Application Order (Order #MD-001)
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
Attempt 1        Attempt 2        Attempt 3
(status: failed) (status: failed) (status: paid)  ◄── Authoritative Payment
```

### Razorpay Integration Details
1. **Order Creation (`POST /api/payments/razorpay/create`):**
   - Derived exclusively from backend-computed `order.total`. Client amount submissions are impossible.
   - Converts INR rupees to paise integer (`rupeesToPaise = Math.round(rupees * 100)`).
   - Calls Razorpay API: `razorpay.orders.create({ amount, currency: 'INR', receipt: order._id })`.
   - Creates a new `PaymentAttempt` record with `status: 'created'`.
2. **Payment Verification (`POST /api/payments/razorpay/verify`):**
   - Receives `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }`.
   - Validates ownership: customer must own the associated application order.
   - Computes expected HMAC SHA256 signature using `crypto.createHmac('sha256', config.razorpay.keySecret)` over `${razorpayOrderId}|${razorpayPaymentId}`.
   - Uses timing-safe string comparison (`crypto.timingSafeEqual`).
   - If invalid: marks attempt as `failed` with reason `'Invalid payment signature'`.
   - If valid: marks attempt as `paid`, updates application `Order.paymentStatus = 'paid'` and `paymentMethod = 'razorpay'`.
   - Fires background Web Push alert to admin devices.
3. **Webhook Processing (`POST /api/payments/razorpay/webhook`):**
   - **Crucial Raw Body Handling:** Configured with `express.raw({ type: 'application/json' })` mounted in `app.js` before `express.json()`.
   - Verifies incoming `x-razorpay-signature` header against raw Buffer using `RAZORPAY_WEBHOOK_SECRET`.
   - Handles events:
     - `payment.captured`: Atomic idempotency via `findOneAndUpdate({ razorpayOrderId, webhookProcessed: false, status: { $ne: 'paid' } })`. Marks attempt and order as `paid`.
     - `payment.failed`: Records failure reason without exposing raw internals.
     - `order.paid`: Secondary fallback confirmation.
   - Solves the "browser closed before verification callback" edge case.
4. **Payment Retry Flow (`POST /api/payments/razorpay/retry/:orderId`):**
   - Available when previous payment failed, was cancelled, or abandoned.
   - Validates order is still payable (`orderStatus !== 'cancelled'` and `orderStatus !== 'completed'`).
   - Generates a **brand new Razorpay Order ID** and a new `PaymentAttempt`. Failed attempts are retained for audit and never overwritten.
5. **COD to Online Payment Conversion:**
   - Fully supported in code. If an order was placed as COD and is still pending, the customer can click "Pay Online" on `/my-orders/[id]`. Completing payment transitions `paymentMethod` from `cod` to `razorpay` and `paymentStatus` from `pending` to `paid`.
6. **Refund Flow (`POST /api/admin/payments/:attemptId/refund`):**
   - Admin-exclusive endpoint (`authenticateAdmin`, `requireAdmin`).
   - Validates attempt is `paid` and has an existing `razorpayPaymentId`.
   - Prevents duplicate refunds by checking `attempt.refundId`.
   - Validates amount: must be positive and `<= attempt.amount`.
   - Calls Razorpay Refund API: `razorpay.payments.refund(paymentId, { amount })`.
   - Updates `PaymentAttempt` with `refundId`, `refundAmount`, `refundStatus`. If full refund, sets attempt `status: 'refunded'` and `Order.paymentStatus = 'refunded'`. Supports partial refunds.
7. **Security & Secrets:** All secrets (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) reside solely in environment variables on the backend. Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the frontend checkout script.

---

## 5. ORDER CANCELLATION & REFUND

### Current Implementation Status Breakdown

| Domain | Feature | Status | Implemented Reality |
| :--- | :--- | :--- | :--- |
| **Customer** | In-app order cancellation button/API | ❌ **NOT IMPLEMENTED** | No customer cancellation route exists in `order.routes.js` or `my-orders/[id]/page.jsx`. |
| **Customer** | Automatic COD cancellation | ❌ **NOT IMPLEMENTED** | Customer cannot trigger cancellation from the app. |
| **Customer** | Automatic online payment refund request | ❌ **NOT IMPLEMENTED** | Customer cannot request refunds from web UI; must contact staff. |
| **Admin** | Order cancellation | ✅ **IMPLEMENTED** | Admin can set `orderStatus: 'cancelled'` via `PATCH /api/admin/orders/:id/status`. |
| **Admin** | Reason recording for cancellation | ❌ **NOT IMPLEMENTED** | The `Order` model has no `cancellationReason` field. Status updates only accept `orderStatus`. |
| **Admin** | Razorpay refund execution | ✅ **IMPLEMENTED** | Admin can initiate partial or full refunds from `/dashboard/payments`. Executes via Razorpay API. |
| **Issue Report**| Structured in-app order issue tickets | ❌ **NOT IMPLEMENTED** | No dedicated model or route linking order issues (e.g. wrong item, spill) directly to an Order ID. |
| **Issue Report**| WhatsApp direct issue routing | ✅ **IMPLEMENTED** | `/help` provides pre-filled WhatsApp links for wrong items, food quality, delays, and cancellations. |
| **Issue Report**| General customer feedback submission | ✅ **IMPLEMENTED** | Form on `/contact` submits to `POST /api/contact`, creating `Message` records viewed in Admin. |

### Business Rules Enforced in Code
- An order that has been marked as `cancelled` or `completed` cannot have new payment attempts created against it (`assertOrderPayable` throws `BadRequestError`).
- Cancellation of an order by admin does NOT automatically execute a payment gateway refund. The admin must separately navigate to `/dashboard/payments` to initiate the Razorpay refund.
- Admin status updates maintain independence between `orderStatus` and `paymentStatus`.
- Only payment attempts with status `paid` can be refunded. Duplicate refund initiation on the same attempt is blocked with `ConflictError`.

---

## 6. ADMIN PANEL

### Pages & Capabilities

#### 1. Dashboard (`/dashboard`)
- **File:** [admin/app/dashboard/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/page.js)
- **What Admin Can View:**
  - Total orders count.
  - **Verified Paid Revenue:** Strictly calculated by filtering orders where `paymentStatus === 'paid'`.
  - Active Orders count (kitchen queue: `placed` + `preparing`).
  - Completed orders count.
  - Recent Orders table (5 latest) with direct navigation links.
- **Related APIs:** `GET /api/admin/orders`.

#### 2. Orders Management (`/dashboard/orders`)
- **File:** [admin/app/dashboard/orders/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/orders/page.js)
- **What Admin Can View:** All customer orders with filter tabs: All, Placed, Preparing, Completed, Cancelled.
- **What Admin Can Edit:** Direct row actions to update status (`placed` → `preparing` → `completed`).
- **Related APIs:** `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`.

#### 3. Order Details & Kitchen Ticket (`/dashboard/orders/[id]`)
- **File:** [admin/app/dashboard/orders/[id]/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/orders/%5Bid%5D/page.js)
- **What Admin Can View:**
  - Full customer contact and delivery address with landmark and instructions.
  - Itemized dishes with portion variant snapshots (`single`, `half`, `full`).
  - Financial breakdown: Subtotal, GST, Delivery Fee, Total.
  - Complete Payment Attempt audit history for that specific order.
- **What Admin Can Edit:**
  - Status modal: change `orderStatus` (`placed`, `preparing`, `completed`, `cancelled`).
  - For COD orders: update `paymentStatus` (`pending`, `paid`). Online orders display notice that payment status is webhook-governed.
- **Print Functionality:** Integrated print stylesheet and button for physical kitchen tickets.
- **Driver / WhatsApp Sharing:** "Share with Driver" button generates an emoji-free, UTF-8 WhatsApp delivery ticket and opens `https://wa.me/?text=...`.

#### 4. Payments Management (`/dashboard/payments`)
- **File:** [admin/app/dashboard/payments/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/payments/page.js)
- **What Admin Can View:**
  - Table of all individual `PaymentAttempt` records (failed, pending, paid, refunded).
  - Filter by payment status and method; search by order number, customer, payment ID.
  - Payment Details Modal displaying Razorpay Order ID, Payment ID, amount in Rupees.
- **What Admin Can Create / Execute:**
  - **Initiate Refund:** Enter refund amount in Rupees (backend validates against paise cap), provides optional reason note, and executes live Razorpay refund.
- **Related APIs:** `GET /api/admin/payments`, `POST /api/admin/payments/:attemptId/refund`.

#### 5. Menu Items Management (`/dashboard/menu`)
- **File:** [admin/app/dashboard/menu/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/menu/page.js)
- **What Admin Can View:** Catalog of dishes with image, pricing, category, veg badge, bestseller badge, availability toggle.
- **What Admin Can Edit:** Quick-toggle availability (`isAvailable`), quick-toggle bestseller (`isBestseller`), edit dish details.
- **What Admin Can Delete:** Delete dishes (removes database record and deletes Cloudinary image asset).
- **Related APIs:** `GET /api/admin/menu`, `PATCH /api/admin/menu/:id`, `DELETE /api/admin/menu/:id`.

#### 6. Add Menu Item (`/dashboard/menu/add`) & Edit Menu Item (`/dashboard/menu/[id]/edit`)
- **Files:** [admin/app/dashboard/menu/add/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/menu/add/page.js), [admin/app/dashboard/menu/[id]/edit/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/menu/%5Bid%5D/edit/page.js)
- **What Admin Can Create / Edit:**
  - Dish name, category dropdown.
  - Pricing Type selector: Single price vs. Half & Full portion prices.
  - Dish description.
  - Veg / Non-Veg toggle, Availability toggle, Bestseller toggle.
  - File upload with client-side image preview (uploads multipart/form-data to Cloudinary).
- **Related APIs:** `POST /api/admin/menu`, `PATCH /api/admin/menu/:id`.

#### 7. Categories Management (`/dashboard/categories`)
- **File:** [admin/app/dashboard/categories/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/categories/page.js)
- **What Admin Can View / Create / Edit / Delete:**
  - View all categories with dish counts and active status.
  - Add category with name, optional image upload, and active toggle.
  - Edit category name, replace image, toggle status.
  - Delete category.
- **Related APIs:** `GET /api/admin/categories`, `POST /api/admin/categories`, `PATCH /api/admin/categories/:id`, `DELETE /api/admin/categories/:id`.

#### 8. Delivery Zones Management (`/dashboard/delivery-zones`)
- **File:** [admin/app/dashboard/delivery-zones/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/delivery-zones/page.js)
- **What Admin Can View / Create / Edit / Delete:**
  - Manage geographic delivery sectors in Ayodhya / Faizabad.
  - Zone type: `0-3km` (enforces ₹15 delivery fee) or `3-5km` (enforces ₹30 delivery fee).
  - Sort order and active/inactive toggle.
  - Add, edit, toggle, and delete delivery zones.
- **Related APIs:** `GET /api/admin/delivery-zones`, `POST /api/admin/delivery-zones`, `PATCH /api/admin/delivery-zones/:id`, `DELETE /api/admin/delivery-zones/:id`.

#### 9. Customer Feedback & Messages (`/dashboard/messages`)
- **File:** [admin/app/dashboard/messages/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/messages/page.js)
- **What Admin Can View:** Incoming messages submitted from customer contact form. Filter by status (`new`, `read`, `resolved`) and type (`complaint`, `suggestion`, `query`).
- **What Admin Can Edit:** Change message status ("Mark as Read", "Mark as Resolved", "Mark as New").
- **Related APIs:** `GET /api/admin/messages`, `PATCH /api/admin/messages/:id/status`.

#### 10. Reviews & Ratings (`/dashboard/reviews`)
- **File:** [admin/app/dashboard/reviews/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/reviews/page.js)
- **What Admin Can View:** Customer star ratings (1–5 stars) linked to menu items and customer accounts. Filter by star rating.
- **What Admin Can Delete:** Delete spam or inappropriate reviews (`DELETE /api/admin/reviews/:id`).
- **Related APIs:** `GET /api/admin/reviews`, `DELETE /api/admin/reviews/:id`.

#### 11. Customers Directory (`/dashboard/customers`)
- **File:** [admin/app/dashboard/customers/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/customers/page.js)
- **What Admin Can View:** Client-side aggregation of customer profiles derived from historical orders (`getAdminOrders()`). Displays customer name, phone, email, lifetime orders count, total spent, and last active date.
- **Limitations:** Read-only aggregate. No direct customer ban, edit, or delete functionality exists.

#### 12. Settings & Notifications (`/dashboard/settings`)
- **File:** [admin/app/dashboard/settings/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/settings/page.js)
- **Functionality:** Read-only review of store operational policies, tax rates, and delivery tiers. Interactive Web Push management: enable push on device, disable push, and dispatch live test push alert with audio chime.

#### 13. Dine-in Bookings (`/dashboard/bookings`)
- **File:** [admin/app/dashboard/bookings/page.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/app/dashboard/bookings/page.js)
- **Status:** ⚠️ **PLACEHOLDER / COMING SOON**. Renders an EmptyState card stating that the table reservation management system will be connected in an upcoming phase.

---

## 7. MENU MANAGEMENT

### Data Hierarchy & Variant Pricing System
1. **Categories:** Represented by the `Category` model. Has `name`, unique lowercase `slug` (auto-slugified pre-validation), optional Cloudinary `image` (`url`, `publicId`), and `isActive` boolean.
2. **Menu Items:** Represented by the `MenuItem` model. Each item belongs to a `category` ObjectId reference.
3. **Pricing Types Supported:**
   - **Single Pricing (`pricingType: 'single'`):** Uses the `price` field (positive float). `halfPrice` and `fullPrice` are null.
   - **Variant Pricing (`pricingType: 'half-full'`):** Requires both `halfPrice` and `fullPrice` to be positive numbers. `price` is null.
4. **Availability & Flags:**
   - `isVeg`: Boolean flag (true = Vegetarian, false = Non-Vegetarian).
   - `isBestseller`: Boolean flag displaying prominent recommendation badges.
   - `isAvailable`: Boolean flag. If `false`, item is dimmed on customer UI, cannot be added to cart, and backend order creation will explicitly reject any cart containing it.
5. **Image Processing:** Uploaded images are passed through Multer memory storage and streamed to Cloudinary folder `majedar/menu`. Returned `secure_url` and `public_id` are saved in MongoDB. Updating or deleting an item triggers `cloudinary.uploader.destroy(publicId)`.
6. **Backend to Frontend Flow:** Customer frontend calls `GET /api/menu`, which returns only active items belonging to active categories. The frontend indexes items in `ShopContext`, allowing real-time client-side search and category filtering.

---

## 8. BOOKING SYSTEM

### Implementation Audit
- **Table Reservation Flow:** ❌ **NOT IMPLEMENTED IN CODE**.
- **Customer Booking:** The customer routes `/reserve-table` and `/my-bookings` display informational text directing customers to call the restaurant directly (`tel:+917905404619`).
- **Backend Model:** [backend/src/models/Booking.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Booking.js) exists only as a 6-line comment stub describing future requirements.
- **Backend Routes & Controllers:** [backend/src/routes/booking.routes.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/routes/booking.routes.js), [backend/src/controllers/booking.controller.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/controllers/booking.controller.js), and [backend/src/services/bookings/booking.service.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/services/bookings/booking.service.js) are comment-only stub files. They are NOT mounted in `backend/src/app.js`.
- **Admin Management:** `/dashboard/bookings` displays an `EmptyState` placeholder.
- **Booking Tests:** `backend/tests/bookings/README.md` notes that no tests are implemented.

---

## 9. CUSTOMER ACCOUNT SYSTEM

### Authentication & Lifecycle
- **Signup:** `POST /api/customer-auth/signup` captures `name`, `email`, `phone`, and `password`. The password is encrypted using `bcrypt.hash(password, 10)`. An unverified customer record is created (`emailVerified: false`).
- **Email Verification (OTP):** A 6-digit numeric OTP is generated, hashed with bcrypt, and saved in `CustomerOtp` collection with a 10-minute expiry and 60-second resend cooldown. Resend sends the email. Submitting the code at `POST /api/customer-auth/verify-email` verifies the OTP and sets `emailVerified: true`.
- **Session Issuance & Cookies:** On successful verification or login, a JWT signed with `JWT_SECRET` is set in an HttpOnly cookie:
  - **Cookie Name:** `customer_token`
  - **Expiry:** 7 days (`maxAge: 7 * 24 * 60 * 60 * 1000`)
  - **Security:** `httpOnly: true`, `secure: production`, `sameSite: production ? 'strict' : 'lax'`.
- **Payload:** `{ id: customer._id, type: 'customer', tokenVersion: customer.tokenVersion }`.
- **Session Invalidation:** Password resets increment `tokenVersion`, instantly invalidating all previously issued JWTs across devices.
- **Protected Routes:** Enforced by `authenticateCustomer` middleware. Checks valid signature, expiration, database customer existence, matching `tokenVersion`, and verified email status.
- **Customer Profile:** Accessible via `GET /api/customer-auth/me`.
- **Address Book:** ❌ **NOT IMPLEMENTED**. Delivery addresses are captured ad-hoc per order and snapshot onto the `Order` record; no customer address book model exists.

---

## 10. MESSAGES & SUPPORT

### Workflow & Data Flow
1. **Customer Feedback Submission:**
   - Authenticated customers submit feedback via the form on `/contact` (component `NewsLetter.jsx`).
   - Invokes `POST /api/contact` (mounted also at `/api/messages`).
   - Rate-limited to 10 submissions per 15-minute window per IP.
   - Protected by `authenticateCustomer`. The customer ID, name, email, and phone are pulled directly from the authenticated session.
   - Payload: `{ type: 'complaint' | 'suggestion' | 'query', message: string }`.
   - Anti-spam rule: Checks for identical messages from the same customer within the last 60 seconds and rejects duplicates.
2. **Database Storage:** Stored in the `Message` collection with status `'new'`.
3. **Admin Management:**
   - Admin views all messages at `/dashboard/messages`.
   - Can filter by status (`new`, `read`, `resolved`), type (`complaint`, `suggestion`, `query`), or search text.
   - Admin can update status using `PATCH /api/admin/messages/:id/status`.
4. **Order Issue Reports:**
   - The `/help` page directs customers experiencing order issues (wrong item, delayed food, spill) to open WhatsApp directly with pre-filled messages.
   - There is no database linking between the `Message` model and specific `Order` records.

---

## 11. SECURITY AUDIT

### Implementation Findings
- **Authentication:** Dual JWT cookie architecture:
  - Admin: `token` cookie (8-hour expiry).
  - Customer: `customer_token` cookie (7-day expiry).
  - Both cookies are `HttpOnly` and cannot be accessed by client-side JavaScript (mitigating XSS token theft).
- **Password Security:**
  - Admin: `bcryptjs` hashed with 12 salt rounds (`seed-admin.js`).
  - Customer: `bcryptjs` hashed with 10 salt rounds (`customer-auth.service.js`).
  - Passwords are never stored in plaintext and excluded from default Mongoose queries (`select: false`).
- **Authorization & RBAC:**
  - Admin endpoints guarded by `authenticateAdmin` and `requireAdmin` (`role === 'admin' || role === 'super-admin'`).
  - Ownership validation: In `order.service.js` and `payment-verification.service.js`, the server strictly verifies `order.customer.toString() === req.customer._id.toString()`. Customers cannot view or verify payments for other customers' orders.
- **Input Validation:** Zod schemas applied via `validate(schema, 'body'|'query'|'params')` middleware on every API endpoint. Type safety, string trimming, min/max lengths, and enum values are strictly checked before controller execution.
- **Rate Limiting:** Granular rate limiters configured via `express-rate-limit`:
  - Admin Auth: 10 requests / 15 min.
  - Customer Auth: 20 requests / 15 min.
  - OTP Requests: 10 requests / 15 min.
  - OTP Verification: 15 requests / 15 min.
  - Contact Messages: 10 submissions / 15 min.
  - Payments: 10 requests / 15 min.
- **CORS Configuration:** Configured in `app.js` using `config.cors`. Supports comma-separated origin strings matching `CLIENT_URL`.
- **Request Body Limits:** `express.json({ limit: '10kb' })` and `express.urlencoded({ limit: '10kb' })` guard against memory exhaustion attacks.
- **Payment Security:**
  - Total amounts are calculated strictly on backend from MongoDB prices; client amounts are completely ignored.
  - Razorpay checkout responses verified using HMAC SHA256 cryptographic signatures.
  - Webhook endpoint receives raw Buffer and verifies HMAC signature using webhook secret before JSON parsing.
- **Sensitive Data Exposure:**
  - Mongoose schemas configure `toJSON` and `toObject` transforms to automatically delete `passwordHash`, `otpHash`, and `razorpaySignature`.
  - `.env` template files contain placeholder values only.

---

## 12. DATABASE SCHEMA INVENTORY

### Mongoose Models Documented

#### 1. `Order`
- **File:** [backend/src/models/Order.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Order.js)
- **Fields:** `orderNumber` (String, unique, indexed), `customer` (ObjectId ref `Customer`, indexed), `items` (Array of Snapshot subdocuments: `menuItem`, `name`, `variant`, `unitPrice`, `price`, `quantity`, `image`, `subtotal`), `deliveryAddress` (Subdocument: `firstName`, `lastName`, `phone`, `email`, `address`, `area`, `landmark`, `deliveryZoneId`, `deliveryInstructions`, `deliveryInstructionOther`), `orderType` (enum: `'delivery'`, `'pickup'`, `'dine_in'`), `subtotal` (Number), `gst` (Number), `deliveryFee` (Number), `total` (Number), `paymentMethod` (enum: `'cod'`, `'razorpay'`), `paymentStatus` (enum: `'pending'`, `'paid'`, `'failed'`, `'refunded'`), `orderStatus` (enum: `'placed'`, `'preparing'`, `'completed'`, `'cancelled'`), `pushNotificationSent` (Boolean).
- **Indexes:** `{ customer: 1, createdAt: -1 }`, `{ orderStatus: 1, createdAt: -1 }`, `{ orderNumber: 1 }`.

#### 2. `PaymentAttempt`
- **File:** [backend/src/models/Payment.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Payment.js)
- **Fields:** `order` (ObjectId ref `Order`, indexed), `customer` (ObjectId ref `Customer`, indexed), `razorpayOrderId` (String, unique, indexed), `razorpayPaymentId` (String), `razorpaySignature` (String, `select: false`), `amount` (Number in paise), `currency` (String: `'INR'`), `status` (enum: `'created'`, `'pending'`, `'paid'`, `'failed'`, `'refunded'`), `method` (String), `failureReason` (String), `webhookProcessed` (Boolean, indexed), `webhookEvent` (String), `pushNotificationSent` (Boolean, indexed), `refundId` (String), `refundAmount` (Number in paise), `refundStatus` (String).
- **Indexes:** `{ order: 1, status: 1 }`, `{ order: 1, createdAt: -1 }`, `{ customer: 1, createdAt: -1 }`.

#### 3. `Customer`
- **File:** [backend/src/models/Customer.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Customer.js)
- **Fields:** `name` (String), `email` (String, unique, lowercase, indexed), `phone` (String), `passwordHash` (String, `select: false`), `emailVerified` (Boolean, indexed), `tokenVersion` (Number, default 0).
- **Methods:** `comparePassword(candidatePassword)`.

#### 4. `CustomerOtp`
- **File:** [backend/src/models/CustomerOtp.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/CustomerOtp.js)
- **Fields:** `email` (String, lowercase, indexed), `customerId` (ObjectId ref `Customer`), `type` (enum: `'email_verification'`, `'password_reset'`), `otpHash` (String, `select: false`), `attempts` (Number), `maxAttempts` (Number, default 5), `expiresAt` (Date, TTL indexed), `consumedAt` (Date), `resendCooldownUntil` (Date).
- **Indexes:** TTL index `{ expiresAt: 1 }` with `expireAfterSeconds: 0`. Compound `{ email: 1, type: 1, consumedAt: 1, createdAt: -1 }`.

#### 5. `Admin`
- **File:** [backend/src/models/Admin.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Admin.js)
- **Fields:** `name` (String), `email` (String, unique, lowercase, indexed), `passwordHash` (String, `select: false`), `role` (enum: `'admin'`, `'super-admin'`).
- **Methods:** `comparePassword(candidatePassword)`.

#### 6. `AdminPushSubscription`
- **File:** [backend/src/models/AdminPushSubscription.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/AdminPushSubscription.js)
- **Fields:** `admin` (ObjectId ref `Admin`, indexed), `endpoint` (String, unique, indexed), `p256dh` (String), `auth` (String), `userAgent` (String).

#### 7. `Category`
- **File:** [backend/src/models/Category.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Category.js)
- **Fields:** `name` (String, unique), `slug` (String, unique, lowercase, indexed), `image` (`{ url, publicId }`), `isActive` (Boolean, indexed).
- **Hooks:** Pre-validate hook auto-generates slug from name.

#### 8. `MenuItem`
- **File:** [backend/src/models/MenuItem.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/MenuItem.js)
- **Fields:** `name` (String, indexed), `description` (String), `pricingType` (enum: `'single'`, `'half-full'`), `price` (Number), `halfPrice` (Number), `fullPrice` (Number), `category` (ObjectId ref `Category`, indexed), `image` (`{ url, publicId }`), `isVeg` (Boolean, indexed), `isBestseller` (Boolean, indexed), `isAvailable` (Boolean, indexed).
- **Indexes:** Text search `{ name: 'text', description: 'text' }`.

#### 9. `DeliveryZone`
- **File:** [backend/src/models/DeliveryZone.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/DeliveryZone.js)
- **Fields:** `name` (String, indexed), `type` (enum: `'0-3km'`, `'3-5km'`, indexed), `deliveryFee` (enum: `[15, 30]`), `isActive` (Boolean, indexed), `sortOrder` (Number).
- **Indexes:** Compound index `{ isActive: 1, sortOrder: 1, name: 1 }`.

#### 10. `Message` (also exported as `ContactMessage`)
- **File:** [backend/src/models/Message.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Message.js)
- **Fields:** `customer` (ObjectId ref `Customer`, indexed), `name` (String), `email` (String), `phone` (String), `type` (enum: `'complaint'`, `'suggestion'`, `'query'`, indexed), `message` (String), `status` (enum: `'new'`, `'read'`, `'resolved'`, indexed).
- **Indexes:** `{ status: 1, createdAt: -1 }`.

#### 11. `Review`
- **File:** [backend/src/models/Review.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Review.js)
- **Fields:** `customer` (ObjectId ref `Customer`), `menuItem` (ObjectId ref `MenuItem`), `order` (ObjectId ref `Order`), `rating` (Integer 1–5).
- **Indexes:** Unique compound index `{ customer: 1, menuItem: 1, order: 1 }` (prevents multiple ratings for same dish per order), `{ menuItem: 1, createdAt: -1 }`.

#### 12. `Booking`
- **File:** [backend/src/models/Booking.js](file:///c:/Users/ziddi/Desktop/majedaar/backend/src/models/Booking.js)
- **Status:** ⚠️ **STUB ONLY** (Contains comments describing future Mongoose schema).

---

## 13. API ROUTE INVENTORY

| Method | Endpoint | Auth | Purpose | Request Body / Query | Response Structure | Used By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | None | Server health check | None | `{ status: "ok", message }` | Monitoring / DevOps |
| **POST** | `/api/auth/login` | None (Rate Limited) | Admin credentials login | `{ email, password }` | `{ success, data: { admin } }` + `token` cookie | Admin Login |
| **POST** | `/api/auth/logout` | None | Terminate admin session | None | `{ success, message }` (clears cookie) | Admin Shell |
| **GET** | `/api/auth/me` | Admin Auth | Get admin session | None | `{ success, data: { admin } }` | Admin AuthContext |
| **POST** | `/api/customer-auth/signup` | None (Rate Limited) | Register customer | `{ name, email, phone, password }` | `{ success, message, data: { requiresVerification } }` | Customer Signup |
| **POST** | `/api/customer-auth/login` | None (Rate Limited) | Customer login | `{ email, password }` | `{ success, data: { customer } }` + `customer_token` cookie | Customer Login |
| **POST** | `/api/customer-auth/logout` | None | Customer logout | None | `{ success, message }` (clears cookie) | Customer Navbar / Profile |
| **POST** | `/api/customer-auth/verify-email` | None (Rate Limited) | Verify email with OTP | `{ email, otp }` | `{ success, data: { customer } }` + cookie | Customer Verify Email |
| **POST** | `/api/customer-auth/resend-otp` | None (Rate Limited) | Resend OTP code | `{ email, type }` | `{ success, message }` | Verify Email / Reset |
| **POST** | `/api/customer-auth/forgot-password`| None (Rate Limited) | Send reset code | `{ email }` | `{ success, message }` | Forgot Password |
| **POST** | `/api/customer-auth/reset-password` | None (Rate Limited) | Reset password | `{ email, otp, newPassword }` | `{ success, message }` | Reset Password |
| **GET** | `/api/customer-auth/me` | Customer Auth | Get customer profile | None | `{ success, data: { customer } }` | Customer AuthContext |
| **POST** | `/api/orders` | Customer Auth | Place new order | `{ items, deliveryAddress, deliveryZoneId, paymentMethod, orderType }` | `{ success, data: { order } }` | Place Order Page |
| **GET** | `/api/orders/my` | Customer Auth | Order history | None | `{ success, data: { orders } }` | My Orders Page |
| **GET** | `/api/orders/:id` | Customer Auth | Order receipt detail | None | `{ success, data: { order } }` | Order Details Page |
| **GET** | `/api/admin/orders` | Admin Auth | List all orders | Query: `orderStatus`, `paymentStatus` | `{ success, data: { orders } }` | Admin Dashboard & Orders |
| **GET** | `/api/admin/orders/:id` | Admin Auth | Order detail | None | `{ success, data: { order } }` | Admin Order Detail |
| **PATCH**| `/api/admin/orders/:id/status` | Admin Auth | Update order/payment status | `{ orderStatus, paymentStatus }` | `{ success, data: { order } }` | Admin Order Detail Modal |
| **POST** | `/api/payments/razorpay/create` | Customer Auth | Create Razorpay Order | `{ orderId }` | `{ success, data: { razorpayOrderId, amount, currency } }` | Place Order Flow |
| **POST** | `/api/payments/razorpay/verify` | Customer Auth | Verify payment HMAC | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }` | `{ success, data: { order } }` | Place Order / Order Details |
| **POST** | `/api/payments/razorpay/retry/:orderId`| Customer Auth | Create fresh attempt | None | `{ success, data: { razorpayOrderId, amount } }` | Order Details (Pay Now) |
| **POST** | `/api/payments/razorpay/webhook` | Raw HMAC Signature | Server-to-server webhook | Raw JSON Buffer | `{ success, message }` | Razorpay Gateway |
| **GET** | `/api/admin/payments` | Admin Auth | Audit payment attempts | Query: `status`, `method`, `page`, `limit` | `{ success, data: { attempts, total, page } }` | Admin Payments Page |
| **GET** | `/api/admin/payments/order/:orderId` | Admin Auth | Order payment history | None | `{ success, data: { attempts } }` | Admin Order Detail |
| **POST** | `/api/admin/payments/:attemptId/refund` | Admin Auth | Process Razorpay refund | `{ amountInPaise, reason }` | `{ success, data: { attempt } }` | Admin Payments (Refund Modal) |
| **GET** | `/api/menu` | None | Public menu catalog | Query: `category`, `search`, `isVeg`, `isBestseller` | `{ success, data: { menuItems } }` | Storefront / ShopContext |
| **GET** | `/api/menu/:id` | None | Public dish detail | None | `{ success, data: { menuItem } }` | Product Detail Page |
| **GET** | `/api/menu/:menuItemId/reviews` | None | Reviews for a dish | Query: `page`, `limit` | `{ success, data: { reviews, total } }` | Product Detail Page |
| **POST** | `/api/admin/menu` | Admin Auth | Create menu item | Multipart/form-data (fields + image) | `{ success, data: { menuItem } }` | Admin Add Item |
| **GET** | `/api/admin/menu` | Admin Auth | Admin menu catalog | Query: `category`, `search`, `pricingType` | `{ success, data: { menuItems } }` | Admin Menu Page |
| **GET** | `/api/admin/menu/:id` | Admin Auth | Admin item detail | None | `{ success, data: { menuItem } }` | Admin Edit Item |
| **PATCH**| `/api/admin/menu/:id` | Admin Auth | Update menu item | Multipart/form-data | `{ success, data: { menuItem } }` | Admin Edit / Quick Toggle |
| **DELETE**| `/api/admin/menu/:id` | Admin Auth | Delete menu item | None | `{ success, message }` | Admin Menu Page |
| **GET** | `/api/categories` | None | Active categories list | None | `{ success, data: { categories } }` | Storefront / ShopContext |
| **POST** | `/api/admin/categories` | Admin Auth | Create category | Multipart/form-data (name, image) | `{ success, data: { category } }` | Admin Categories Page |
| **GET** | `/api/admin/categories` | Admin Auth | All categories | None | `{ success, data: { categories } }` | Admin Categories / Add Item |
| **PATCH**| `/api/admin/categories/:id` | Admin Auth | Update category | Multipart/form-data | `{ success, data: { category } }` | Admin Categories Page |
| **DELETE**| `/api/admin/categories/:id` | Admin Auth | Delete category | None | `{ success, message }` | Admin Categories Page |
| **GET** | `/api/delivery-zones` | None | Active delivery zones | None | `{ success, data: { zones } }` | Place Order Page |
| **GET** | `/api/admin/delivery-zones` | Admin Auth | All delivery zones | None | `{ success, data: { zones } }` | Admin Delivery Zones |
| **POST** | `/api/admin/delivery-zones` | Admin Auth | Create delivery zone | `{ name, type, sortOrder, isActive }` | `{ success, data: { zone } }` | Admin Delivery Zones |
| **PATCH**| `/api/admin/delivery-zones/:id` | Admin Auth | Update delivery zone | `{ name, type, sortOrder, isActive }` | `{ success, data: { zone } }` | Admin Delivery Zones |
| **DELETE**| `/api/admin/delivery-zones/:id` | Admin Auth | Delete delivery zone | None | `{ success, message }` | Admin Delivery Zones |
| **POST** | `/api/reviews` | Customer Auth | Submit dish review | `{ orderId, menuItemId, rating }` | `{ success, data: { review } }` | Order Details Rating |
| **GET** | `/api/reviews/my` | Customer Auth | Customer reviews log | None | `{ success, data: { reviews } }` | Customer History |
| **GET** | `/api/admin/reviews` | Admin Auth | Monitor all ratings | Query: `rating`, `page`, `limit` | `{ success, data: { reviews } }` | Admin Reviews Page |
| **DELETE**| `/api/admin/reviews/:id` | Admin Auth | Remove rating | None | `{ success, message }` | Admin Reviews Page |
| **POST** | `/api/contact` | Customer Auth | Submit feedback | `{ type, message }` | `{ success, message }` | Contact Page (`NewsLetter`) |
| **GET** | `/api/admin/messages` | Admin Auth | List messages | Query: `status`, `type`, `search` | `{ success, data: { messages } }` | Admin Messages Page |
| **GET** | `/api/admin/messages/unread-count`| Admin Auth| Badge counter | None | `{ success, data: { count } }` | Admin Navigation Badge |
| **PATCH**| `/api/admin/messages/:id/status` | Admin Auth | Update message status| `{ status }` | `{ success, data: { message } }` | Admin Messages Page |
| **GET** | `/api/admin/push/vapid-public-key`| Admin Auth| Public VAPID key | None | `{ success, data: { publicKey } }` | Admin Push Setup |
| **POST** | `/api/admin/push/subscribe` | Admin Auth | Register browser push | `{ subscription, userAgent }` | `{ success, message }` | Admin Settings / Shell |
| **POST** | `/api/admin/push/unsubscribe` | Admin Auth | Deregister push | `{ endpoint }` | `{ success, message }` | Admin Settings |
| **POST** | `/api/admin/push/test` | Admin Auth | Trigger test alert | None | `{ success, message }` | Admin Settings |

---

## 14. FRONTEND ↔ BACKEND CONNECTIONS

### Client Utilities & Abstractions
- **HTTP Client (`frontend/lib/api/client.js`):** Unified fetch wrapper handling baseUrl (`NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'`), automatic JSON serialization, `credentials: "include"`, response extraction (`json.data || json`), and error normalization (`throw new Error(json.message)`).
- **Hooks:**
  - `useRazorpay` ([frontend/hooks/useRazorpay.js](file:///c:/Users/ziddi/Desktop/majedaar/frontend/hooks/useRazorpay.js)): Manages asynchronous loading of Razorpay Checkout script (`https://checkout.razorpay.com/v1/checkout.js`), modal instantiation, brand theming (`#1B3B2B`), and dispatches `onSuccess`, `onFailure`, and `onDismiss` callbacks.
  - `useAuth`: Exposes authentication state, customer profile, and auth methods.
- **Contexts:**
  - `ShopContext`: Maintains products catalog, categories, cart operations, delivery tier estimates, search state.
  - `AuthContext`: Maintains customer login state, profile loading, and logout.
- **Optimistic Updates:** The application intentionally **avoids optimistic updates** for financial transactions and order states. It waits for authoritative backend confirmation before mutating UI state or clearing the cart.

---

## 15. WHATSAPP & DRIVER FLOW

### Implementation & Verification
Driver sharing is implemented as a pure utility in [admin/lib/whatsapp.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/lib/whatsapp.js) and covered by automated tests in [admin/lib/whatsapp.test.mjs](file:///c:/Users/ziddi/Desktop/majedaar/admin/lib/whatsapp.test.mjs).

#### 1. Information Transmitted
The generated message contains strictly operational delivery parameters:
- **Header:** `MAJEDAAR RESTAURANT\n--------------------`
- **Order Identification:** `Order: #MD-YYMMDD-XXXXXX`
- **Customer:** Name and Phone number.
- **Delivery Address:** Street address, delivery sector/area.
- **Landmark:** Included if specified by customer; cleanly omitted if empty.
- **Delivery Instructions:** "Call on arrival", "Leave at the gate", etc.
- **Amount:** Backend-authoritative order total in Indian Rupees (`Amount: ₹XXX.XX`).
- **Payment Information:** Clear payment status (`Payment: COD - Pending`, `Payment: Online - Paid`, etc.).
- **Footer:** `--------------------\nPlease deliver this order to the customer.`

#### 2. Formatting & Encoding Rules
- **Zero Emojis:** Completely free of emojis (no scooters, money bags, pins) to prevent rendering and encoding corruption across SMS/WhatsApp web clients.
- **Encoding:** Message is URL-encoded via `encodeURIComponent` and opened using the official WhatsApp click-to-chat API: `https://wa.me/?text=${encodeURIComponent(message)}`.
- **Driver Number Independence:** The URL does not hardcode a driver's phone number (`wa.me/?text=...`), enabling the restaurant manager to choose any delivery rider or group chat upon click.

---

## 16. BRANDING & UI DESIGN SYSTEM

### Visual Tokens & Assets
- **Color Palette:**
  - Primary Brand Green: `#1B3B2B` (Forest Green)
  - Dark Surface / Header: `#11261B` (Deep Hunter Green)
  - Accent / Saffron: `#C85A17` (Warm Terracotta / Saffron)
  - Background Neutral: `#FAF8F5` (Warm Cream / Off-White)
  - Border Line: `#E7E5E4` / `#D6D3D1` (Stone Gray)
- **Typography:**
  - Body & UI: `Manrope` (Google Font)
  - Headings & Editorial: `Cinzel` & `Cormorant Garamond` (Google Fonts)
- **Logo Assets:**
  - Vector Mark: [frontend/public/brand/logo-mark.svg](file:///c:/Users/ziddi/Desktop/majedaar/frontend/public/brand/logo-mark.svg)
  - Full Signature: [frontend/public/brand/logo-full.png](file:///c:/Users/ziddi/Desktop/majedaar/frontend/public/brand/logo-full.png)
  - Favicons: Scalable SVG vector icon configured in root layout.
- **Branded Loader (`BrandedLoader.jsx`):** Renders a luxury vector reveal of the Majedaar brand mark during initial site entry. Caches status in `sessionStorage` and respects `prefers-reduced-motion`.
- **Sticky Cart Bar (`StickyCartBar.jsx`):** Mobile-optimized floating action pill displaying item count and total, persisting across public browsing pages.
- **PWA Status:**
  - Frontend: ❌ **NO PWA MANIFEST**. No `manifest.json` or offline service worker exists on the customer website.
  - Admin: ✅ **SERVICE WORKER PRESENT** ([admin/public/sw.js](file:///c:/Users/ziddi/Desktop/majedaar/admin/public/sw.js)), specifically managing Web Push notifications and notification-click deep linking.

---

## 17. SEO AUDIT

### Implementation Highlights
- **Global Metadata:** Configured in `frontend/app/layout.jsx` using `metadataBase` (`https://majedaar.com`), descriptive title templates (`%s | Majedaar Restaurant`), meta description emphasizing authentic Indian cuisine and home delivery in Ayodhya.
- **Canonical URLs:** Configured across all public pages (`/`, `/orderanddine`, `/contact`, `/reserve-table`, `/faqs`, `/help`, `/product/[id]`).
- **OpenGraph & Twitter:** Comprehensive cards configured with `summary_large_image` and localized branding images.
- **Robots Configuration (`frontend/app/robots.js`):** Allows crawling of public landing and menu pages while disallowing indexing of private transactional paths (`/cart`, `/place-order`, `/login`, `/signup`, `/my-orders`, `/api/`).
- **Dynamic XML Sitemap (`frontend/app/sitemap.js`):** Generates indexable URLs dynamically by querying all active dish IDs from the backend API.
- **Structured Data (Schema.org):**
  - Root layout injects `schema.org/Restaurant` JSON-LD with geo-coordinates (`26.7828564, 82.1624034`), opening hours, telephone, address on Ram Path, Sahabganj.
  - Product page injects `schema.org/Product` and `Offer` JSON-LD with pricing, currency (INR), and aggregate ratings.

---

## 18. TESTING SUITE

### Inventory of Existing Tests

| Test Suite File | Subsystem Tested | Framework | Verified Status |
| :--- | :--- | :--- | :--- |
| `admin/lib/whatsapp.test.mjs` | WhatsApp order string formatting, zero-emoji guarantee, clean string helpers, UTF-8 URL encoding. | Node.js `node:assert/strict` | ✅ **8/8 Tests Passing** |
| `backend/tests/menu/variant-pricing.test.js` | Single vs Half/Full Zod schemas, database calculations, variant consolidation. | `node:test` + Mongoose | Implemented |
| `backend/tests/orders/orders.test.js` | Order creation, inventory availability checks, minimum order amount, GST & delivery fee logic. | `node:test` + Mongoose | Implemented |
| `backend/tests/payments/payment.test.js` | Razorpay order creation, HMAC signature verification, webhook processing, idempotency, refund limits. | `node:test` + Mongoose | Implemented |
| `backend/tests/auth/auth.test.js` | Admin authentication, password hashing, session cookies. | `node:test` + Mongoose | Implemented |
| `backend/tests/auth/customer-auth.test.js` | Customer registration, login, JWT issuance, rate limiting. | `node:test` + Mongoose | Implemented |
| `backend/tests/auth/customer-verification-and-reset.test.js` | OTP generation, 6-digit validation, email verification, password resets. | `node:test` + Mongoose | Implemented |
| `backend/tests/auth/dev-email-mode.test.js` | Fallback OTP logging when Resend API key is absent. | `node:test` | Implemented |
| `backend/tests/delivery/delivery-zones.test.js` | Tier 1 (₹15) vs Tier 2 (₹30) delivery zone validations and sorting. | `node:test` + Mongoose | Implemented |
| `backend/tests/contact/messages.test.js` | Contact message submission, duplicate spam prevention, admin status updates. | `node:test` + Mongoose | Implemented |
| `backend/tests/reviews/reviews.test.js` | Star rating creation, one-review-per-dish uniqueness constraint, aggregations. | `node:test` + Mongoose | Implemented |
| `backend/tests/notifications/admin-push.test.js` | Web Push subscription persistence and VAPID notification triggers. | `node:test` + Mongoose | Implemented |
| **Frontend Unit Tests** | React components, contexts, hooks. | *None configured* | ❌ No tests in `/frontend` |

---

## 19. BUILD & DEPLOYMENT CONFIGURATION

### Environments & Startup
- **Backend:**
  - Engine requirement: Node `>=20`.
  - Development startup: `npm run dev` (`node --watch src/server.js`).
  - Production startup: `npm start` (`node src/server.js`).
  - Database seeding: `npm run seed:admin` (`node src/scripts/seed-admin.js`).
- **Frontend:**
  - Build command: `npm run build` (`next build`).
  - Production server: `npm start` (`next start`).
  - Framework: Next.js 14.2.18 (Standalone or Node server).
- **Admin:**
  - Build command: `npm run build` (`next build`).
  - Production server: `npm start` (`next start`).
  - Framework: Next.js 16.3.5.

### Environment Variable Requirements (Names Only)

#### Backend (`/backend/.env`):
- `PORT`: HTTP listener port (e.g. 5000).
- `NODE_ENV`: Runtime environment (`development` | `production`).
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: 32+ character cryptographic secret for session signing.
- `JWT_EXPIRES_IN`: Admin token duration (e.g. `8h`).
- `CLIENT_URL`: Allowed CORS origin(s) for browser requests.
- `RESEND_API_KEY`: API token for transactional email dispatch.
- `EMAIL_FROM`: Verified sender identity (e.g., `Majedaar Restaurant <onboarding@resend.dev>`).
- `RAZORPAY_KEY_ID`: Public Razorpay key.
- `RAZORPAY_KEY_SECRET`: Private Razorpay secret for HMAC signature generation.
- `RAZORPAY_WEBHOOK_SECRET`: Webhook secret for HMAC header verification.
- `VAPID_PUBLIC_KEY`: Web Push VAPID public key.
- `VAPID_PRIVATE_KEY`: Web Push VAPID private signing key.
- `VAPID_SUBJECT`: `mailto:` contact for web-push alerts.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary media cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API credential.
- `CLOUDINARY_API_SECRET`: Cloudinary API private credential.
- `RESTAURANT_IS_OPEN`: Master operational killswitch (`true` | `false`).
- `DELIVERY_FEE_TIER1`: Override fee for 0–3 km (default: 15).
- `DELIVERY_FEE_TIER2`: Override fee for 3–5 km (default: 30).
- `MINIMUM_ORDER_AMOUNT`: Minimum subtotal threshold (default: 100).

#### Frontend (`/frontend/.env`):
- `NEXT_PUBLIC_API_URL`: Backend API base URL (e.g. `http://localhost:5000/api`).
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key ID for client-side modal.
- `NEXT_PUBLIC_SITE_URL`: Base domain for SEO canonicals & sitemap (e.g. `https://majedaar.com`).

#### Admin (`/admin/.env`):
- `NEXT_PUBLIC_API_URL`: Backend API base URL.

---

## 20. CURRENT FUNCTIONALITY MATRIX

| Feature Area | Customer Web | Admin Panel | Backend API | Database Model | Payment Integration | Current Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Catalog & Menu Display** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Variant Pricing (Half/Full)**| ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Item Availability Toggle** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Cart & Quantity Management**| ✅ | N/A | N/A | N/A | N/A | ✅ **Implemented** |
| **Minimum Order Rule (₹100)** | ✅ | N/A | ✅ | N/A | N/A | ✅ **Implemented** |
| **Tiered Delivery Zones** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Order Placement (COD)** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Order Placement (Razorpay)**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Razorpay Signature Check** | N/A | N/A | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Razorpay Webhooks** | N/A | N/A | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Payment Retry Flow** | ✅ | N/A | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **COD to Online Payment** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Admin Payment Audit** | N/A | ✅ | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Admin Razorpay Refunds** | N/A | ✅ | ✅ | ✅ | ✅ | ✅ **Implemented** |
| **Customer Order History** | ✅ | N/A | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Order Details & Receipt** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Driver WhatsApp Sharing** | N/A | ✅ | N/A | N/A | N/A | ✅ **Implemented** |
| **Kitchen Status Management** | N/A | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Star Ratings & Reviews** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Customer Auth & OTP** | ✅ | N/A | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Admin Auth & RBAC** | N/A | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Web Push Notifications** | N/A | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Contact / Feedback Form** | ✅ | ✅ | ✅ | ✅ | N/A | ✅ **Implemented** |
| **Local SEO & Schema.org** | ✅ | N/A | N/A | N/A | N/A | ✅ **Implemented** |
| **Customer Cancellation** | ❌ | N/A | ❌ | ❌ | ❌ | ❌ **Not Implemented** |
| **Admin Cancellation Reason** | N/A | ❌ | ❌ | ❌ | N/A | ⚠️ **Partial** (Status only) |
| **Order Issue In-App Tickets**| ⚠️ | N/A | ❌ | ❌ | N/A | ⚠️ **Partial** (Via WhatsApp/Feedback) |
| **Table Booking System** | ❌ | ❌ | ❌ | ❌ | N/A | ❌ **Not Implemented** (Stubs) |
| **Customer Address Book** | ❌ | N/A | ❌ | ❌ | N/A | ❌ **Not Implemented** |
| **Customer Profile Edit** | ❌ | N/A | ❌ | ❌ | N/A | ❌ **Not Implemented** |
| **Re-Order Quick Button** | ❌ | N/A | ❌ | N/A | N/A | ❌ **Not Implemented** |

---

## 21. COMPLETE USER JOURNEYS

### Standard Fulfillment Journey
1. **Discovery:** Customer visits `https://majedaar.com/` and explores the curated Bestseller section or taps "Order & Dine".
2. **Item Customization:** Customer selects a dish (e.g., Chicken Curry), toggles the portion portion from "Half" (₹120) to "Full" (₹220), and clicks "Add to Order".
3. **Cart Assembly:** Sticky floating cart bar updates instantly. Customer taps "View Cart", verifies dish quantities, and confirms subtotal meets the ₹100 minimum threshold.
4. **Checkout Transition:** Customer clicks "Proceed to Checkout". If not authenticated, site prompts login/signup with seamless redirect back to checkout.
5. **Address & Delivery Options:** Customer selects delivery area (e.g. Sahabganj: Tier 1, ₹15), adds house details and landmark, selects delivery instruction ("Call on arrival").
6. **Payment Decision:**
   - *If COD:* Clicks "Place Order (Cash on Delivery)". Order is immediately registered as `orderStatus: placed` and `paymentStatus: pending`. Cart is emptied. Customer lands on `/my-orders/[id]`.
   - *If Razorpay:* Clicks "Pay Online & Confirm". Razorpay modal loads. Customer completes payment via UPI. Backend verifies HMAC signature. Order is confirmed as `paid`.
7. **Kitchen Processing:** Backend automatically dispatches Web Push notification to registered manager devices ("New Order — Majedaar #MD-XXXXXX"). Manager opens `/dashboard/orders`, clicks "Preparing".
8. **Driver Dispatch:** Manager opens order ticket, clicks "Share with Driver". Clean WhatsApp delivery ticket opens in WhatsApp. Manager forwards ticket to rider.
9. **Fulfillment & Rating:** Rider delivers food. Manager marks order `completed`. Customer visits `/my-orders/[id]` and gives a 5-star rating to each dish.

### Alternative / Exception Journeys
- **Online Payment Failure / Dismissal:** Customer closes payment popup or card is declined. The order is preserved safely in the database as `paymentStatus: pending`. The customer is navigated to `/my-orders/[id]`, where a prominent "Pay Online" button remains active. The customer can retry anytime via UPI or choose to pay cash upon arrival.
- **COD to Online Payment Conversion:** A customer who originally placed an order as Cash on Delivery decides to pay online while food is cooking. On `/my-orders/[id]`, they click "Pay Online", complete Razorpay checkout, and the system automatically converts the order to Online / Paid.
- **Admin Cancellation & Refund:** An item runs out after order placement. Manager opens `/dashboard/orders/[id]` and changes status to `cancelled`. Manager then opens `/dashboard/payments`, clicks "Refund", enters the refund amount, and triggers a live Razorpay API refund back to the customer's account.

---

## 22. CURRENT GAPS & TECHNICAL RISKS

### Gaps Supported by Code Inspection

#### 1. Missing Functionality
- **Table Booking Subsystem:** Entirely missing. The database model, service, controller, and routes are empty stubs. The admin page is an empty state card; customer pages show static phone contact info.
- **Customer Self-Service Cancellation:** No endpoint or UI mechanism allows a customer to cancel an order within any timeframe.
- **Structured Order Issue Reporting:** Complaints submitted on `/contact` lack foreign key linkages to specific order numbers or items.
- **Customer Address Book:** Customers cannot save multiple delivery addresses in their account; address details must be re-entered on every order.
- **Customer Profile Editing:** Customers cannot update their name, email, or phone number from `/my-profile`.

#### 2. Partial Functionality
- **Admin Customer Management:** Driven by client-side aggregation of orders rather than a dedicated customer management backend.
- **Admin Cancellation Reasons:** Cancellation reasons cannot be recorded in the database.
- **PWA Capabilities:** Admin possesses a service worker for Web Push, but customer frontend lacks web app manifests and offline support.

#### 3. Technical Risks & Production Checks
- **In-Memory Store Status / Config Setters:** In `backend/src/config/restaurant.config.js`, store opening status and delivery fee setters mutate in-memory module variables. In multi-instance or serverless deployments, these values reset upon server restart. Store configuration must be persisted in a database collection.
- **Test Database Dependency:** Backend test suites connect to `mongodb://localhost:27017/majedar_test`. If local MongoDB is not running, test executions will hang or fail.
- **Resend Domain Verification:** If `RESEND_API_KEY` is not provided or unverified, OTPs are only printed to backend console logs (Dev Mode), which is unsuited for production customer signups.

---

## 23. IMPORTANT BUSINESS RULES ENFORCED IN CODE

1. **Store Operational Check:** If `restaurantConfig.isOpen === false`, order creation throws `400 BadRequestError ('The restaurant is currently closed')`.
2. **Item Pricing Authority:** Client-submitted prices are discarded. Server looks up database prices per portion variant (`single`, `half`, `full`).
3. **Item Availability Check:** If any item in the order has `isAvailable === false`, order creation fails immediately.
4. **Minimum Order Threshold:** Subtotal must be at least **₹100**; otherwise rejected.
5. **Delivery Radius Restriction:** Deliveries beyond 5.0 km are rejected with `BadRequestError`.
6. **GST Calculation:** Exactly 5.0% GST applied strictly to food items, rounded to 2 decimal places.
7. **Payable Order State Restrictions:** Payments can only be initiated or verified on orders that are NOT `cancelled`, NOT `completed`, and NOT already `paid`.
8. **Payment Idempotency:** Webhook and frontend verification verify signature before updating database. Once marked `paid`, subsequent duplicate events are ignored safely.
9. **Refund Authority & Cap:** Only `paid` attempts can be refunded. Refund amount in paise cannot exceed the original payment amount.
10. **Review Uniqueness:** A customer can only review a given menu item once per order (`{ customer: 1, menuItem: 1, order: 1 }` unique index). Reviews can only be submitted for completed orders.
11. **Session Invalidation:** Changing customer password increments `tokenVersion`, instantly revoking all existing JWT cookies across all client devices.

---

## 24. FINAL SUMMARY

### A. What is Fully Working
- End-to-end customer ordering flow for both COD and Online Payments (Razorpay).
- Authoritative backend pricing, variant pricing (Half/Full), 5% GST, and tiered delivery fees (₹15 / ₹30).
- Cryptographic Razorpay payment verification, webhook handling with raw HMAC verification, multi-attempt audit logging, and payment retry flow.
- Admin dashboard, order status transitions, kitchen ticket printing, and emoji-free WhatsApp delivery sharing.
- Admin Razorpay refunds with partial/full support.
- Menu catalog CRUD with Cloudinary image streaming and automatic cleanup.
- Delivery zones CRUD with active/inactive toggles.
- Customer star ratings per dish on completed orders.
- Customer authentication with 6-digit email OTPs, password reset, and secure HttpOnly cookies.
- Admin Web Push notifications with background service worker and sound chimes.
- Local SEO, canonical URLs, robots.txt, dynamic XML sitemap, and Schema.org JSON-LD structured data.

### B. What is Partially Implemented
- **Customer Issue Reporting:** Handled through generic contact forms and WhatsApp links; lacks direct database linkage to specific order records.
- **Admin Customer Management:** Displays customer activity by aggregating orders on the client side; lacks dedicated admin customer API and customer CRUD.
- **Order Cancellation Management:** Admin can cancel orders, but no cancellation reason is recorded in the database.

### C. What is Missing
- Table booking system (backend models and routes are empty stubs; UI shows placeholder text).
- Customer-initiated order cancellation.
- Re-order quick action button.
- Customer address book and profile edit functionality.
- Customer PWA manifest.

### D. Important Technical Risks
- In-memory configuration setters for store operational status and delivery fees reset upon process restarts.
- Email OTP delivery falls back to console logging in development mode if Resend is not configured.

### E. Important Production Checks Still Required
- Set production environment variables: `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Configure webhook URL on Razorpay Dashboard pointing to `https://<backend-domain>/api/payments/razorpay/webhook`.
- Verify sender domain on Resend dashboard for `EMAIL_FROM`.
- Seed initial production admin using `npm run seed:admin`.

---

## PROJECT STATUS AT A GLANCE

```
================================================================================
                    MAJEDAAR RESTAURANT — SYSTEM STATUS
================================================================================
Core Ordering & Cart System:            ✅ IMPLEMENTED (Full Production Ready)
Authoritative Pricing & Variants:       ✅ IMPLEMENTED (Single & Half/Full)
Tiered Delivery Zones (0-3km/3-5km):    ✅ IMPLEMENTED (₹15 & ₹30 Tiers)
Razorpay Payment Gateway:               ✅ IMPLEMENTED (Checkout, Verify, Webhook)
Payment Retry & COD-to-Online:          ✅ IMPLEMENTED (Fully Supported)
Admin Razorpay Refunds:                 ✅ IMPLEMENTED (Partial & Full)
Admin Operations & Orders:              ✅ IMPLEMENTED (Live Kitchen Queue)
WhatsApp Driver Sharing:                ✅ IMPLEMENTED (Clean, Zero-Emoji UTF-8)
Menu & Categories Management:           ✅ IMPLEMENTED (Cloudinary Storage)
Customer Star Ratings (1-5★):           ✅ IMPLEMENTED (Completed Orders Only)
Customer Auth & Email OTP:              ✅ IMPLEMENTED (Bcrypt, JWT, HttpOnly)
Admin Web Push Notifications:           ✅ IMPLEMENTED (VAPID & Service Worker)
Local SEO & Schema.org JSON-LD:         ✅ IMPLEMENTED (Sitemap, Robots, Schema)
Customer Order Cancellation:            ❌ NOT IMPLEMENTED
Customer Issue Reporting to DB:         ⚠️ PARTIAL (Via WhatsApp & Contact Form)
Customer Address Book:                  ❌ NOT IMPLEMENTED
Table Booking Subsystem:                ❌ NOT IMPLEMENTED (Comment Stubs Only)
Customer PWA Manifest:                  ❌ NOT IMPLEMENTED
================================================================================
```

*Report compiled and verified from direct source code inspection of `/frontend`, `/admin`, and `/backend`.*
