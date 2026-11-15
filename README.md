# Reading Ocean

A spatial, 3D-inspired interactive bookstore and digital library web application built with React, Vite, Tailwind CSS, and Framer Motion. Designed around a warm walnut, cream, and brass architectural room aesthetic, **Reading Ocean** replaces traditional e-commerce grids with tactile bookshelves, spring-physics book spines, a two-page book spread reader, and an end-to-end checkout and print-optimized invoicing flow.

**Live Demo:** [https://reading-ocean.vercel.app/](https://reading-ocean.vercel.app/)

---

## Features

* **Spatial 3D Bookshelf Interface:** Interactive walnut bookcase illuminated by ambient pendant lighting. Hovering or focusing on upright genre spines smoothly pulls them forward in 3D space with spring physics; clicking opens a curated genre showcase divided into *Curated Recommendations* and *Available to Purchase*.
* **Two-Page Book Spread Modal:** Clicking any book opens a tactile hardcover spread displaying edition metadata, full synopsis, pricing in INR (`₹`), wishlist toggling, and instant cart addition.
* **Live Multi-Genre Search:** Real-time filtering across book titles, authors, and genres with keyboard accessibility.
* **Persistent Store State:** Powered by React Context and `localStorage` so the shopping cart (with quantity controls), wishlist, user session (Sign In / Sign Up / Guest mode), and order history persist seamlessly across reloads.
* **Multi-Step Checkout & Payment Simulation:**
  * Customer shipping details with auto-fill for logged-in users and guest checkout support.
  * Payment tabs for **UPI / QR Code** (local scannable QR generation via `qrcode-generator`), **Credit/Debit Card** (with masked card number handling), and **NetBanking**.
* **Print-Optimized A4 Tax Invoice:** Generates a unique Order ID (e.g., `RO-2026-8492`), itemized pricing with CGST/SGST breakdown, an archival `VERIFIED PAID` stamp, and dedicated `@media print` CSS rules that output a clean, standalone single-page A4 receipt via `window.print()`. Past invoices can be re-opened and printed anytime from the order history modal.
* **Responsive Desktop & Mobile Layouts:** Adapts from a full architectural library room on desktop (`1440px+`) to a mobile-first vertical shelf and drawer sheet (`390px+`).

---

## Tech Stack

* **Frontend:** React, Vite
* **Styling:** Tailwind CSS, Custom CSS (`@media print` rules, 3D perspective transforms)
* **Animations:** Framer Motion (with `prefers-reduced-motion` support)
* **Typography:** Cormorant Garamond (editorial display) & Inter (UI/body)
* **Utilities:** `qrcode-generator` (client-side SVG QR generation)
* **Deployment:** Vercel

---

## Project Structure

```text
├── index.html                  # Entry HTML with custom inline SVG favicon
├── src/
│   ├── components/
│   │   ├── AccountMenu.jsx     # Logged-in user dropdown (Orders, Logout)
│   │   ├── AuthModal.jsx       # Login, Sign Up, and Guest access modal
│   │   ├── BookshelfRoom.jsx   # Interactive 3D bookshelf room & genre drawers
│   │   ├── BookSpreadModal.jsx # Two-page open book detail & action modal
│   │   ├── CartDrawer.jsx      # Slide-over cart with quantity & subtotal controls
│   │   ├── CheckoutModal.jsx   # Multi-step shipping & payment flow (UPI/Card/NetBanking)
│   │   ├── InfoModal.jsx       # About & Contact modals
│   │   ├── Invoice.jsx         # Printable A4 Tax Invoice with SVG paid stamp
│   │   ├── OrdersModal.jsx     # Past orders list with invoice re-viewer
│   │   ├── SearchPanel.jsx     # Real-time search overlay
│   │   ├── ui.jsx              # Shared reusable modal, drawer, and button primitives
│   │   └── WishlistDrawer.jsx  # Saved books drawer with one-click move to cart
│   ├── context/
│   │   └── StoreContext.jsx    # Global state & localStorage persistence
│   ├── data/
│   │   └── books.js            # Curated genre and book catalog dataset
│   ├── lib/
│   │   └── checkout.js         # Order ID generation, tax calculation & formatting helpers
│   ├── App.jsx                 # Root layout and modal orchestration
│   ├── index.css               # Tailwind directives, custom variables & print styles
│   └── main.jsx                # React DOM entry point
├── package.json
├── tailwind.config.js
└── vite.config.js
