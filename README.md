# HYPERREAL

> A full-stack, dark-tech fashion e-commerce platform built with Next.js. HyperReal is a portfolio project focused on real-world commerce workflows, operational tooling, and production-minded application architecture.

**Live demo:** https://hyperreal.vercel.app  
**Repository:** https://github.com/gs-shaykot/HyperReal

---

## Overview

HyperReal is an end-to-end e-commerce application for a fictional technical/streetwear brand. It combines a customer storefront with administration and logistics workflows instead of stopping at a static product catalog.

The project is built and maintained as a hands-on engineering portfolio: data modeling, authentication and authorization, cart and checkout, payment handling, inventory-aware product variants, order operations, shipment tracking, and customer support workflows.

## Highlights

### Storefront
- Responsive storefront with a custom HyperReal visual system and light/dark theme control.
- Product catalog, categories, product detail pages, product variants, availability, and image galleries.
- Product search powered by searchable product names and curated `searchKeywords` (e.g. matching “pants”, “trousers”, or “bottoms” to the same product).
- Wishlist, product reviews, helpful-review voting, and customer account experiences.
- Cart with quantity management, coupon application, savings/discount presentation, and checkout flow.
- Editorial Lookbook with outfit-combo cards and interactive product hotspots.

### Checkout & payments
- Stripe checkout integration with dedicated success, failed, and cancelled payment-result experiences.
- Cash on Delivery (COD) flow with country/user eligibility controls.
- Coupon rules, including new-user eligibility and server-side validation.
- Checkout/order idempotency protections to help prevent duplicate order creation.
- Order/payment records and payment-status handling.

### Admin & operations
- Admin product management, product variants, images, inventory, and search keywords.
- Order management and operational status updates.
- Fulfillment and shipment status tracked separately.
- Shipment assignment, delivery zones, courier profiles, and delivery operations.
- Customer return requests, review/inspection stages, return-event history, and refund records.
- Operational country configuration, shipping thresholds/fees, and exchange-rate fields.
- Homepage content controls for marquee and upcoming releases.

### Customer experience & platform
- Authentication, verification, role-based access, blocked-account handling, and session records.
- Notifications and customer notification preferences.
- Order tracking and shipment events.
- Dedicated error/payment-state pages with the HyperReal theme.

## Tech stack

| Area | Technology |
|---|---|
| Application | Next.js 16 (App Router), React 19, TypeScript |
| Styling/UI | Tailwind CSS 4, daisyUI 5, Base UI, Lucide React |
| Client state/data | Redux Toolkit, TanStack Query |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | NextAuth.js |
| Payments | Stripe |
| Media | Cloudinary |
| Rate limiting/cache | Upstash Redis, Upstash Ratelimit |
| Motion & charts | Framer Motion, Recharts |
| Deployment | Vercel |

## Architecture notes

- **Relational domain model:** Prisma models represent users, products, variants, carts, coupons, orders, payments, shipments, returns, refunds, reviews, and operational entities.
- **Server-side enforcement:** Sensitive eligibility and business rules are validated on the server; UI visibility is not treated as authorization.
- **Idempotent checkout:** Checkout keys/fingerprints are persisted to support safe retry behavior.
- **Operational state separation:** Order, payment, fulfillment, and shipment statuses represent different parts of the lifecycle.
- **Auditability:** Return and shipment events preserve workflow history.

## Getting started

### Prerequisites
- Node.js (use a version compatible with the installed Next.js release)
- npm
- PostgreSQL database
- Required provider accounts/credentials for the integrations you want to run (Stripe, Cloudinary, email, and Redis where applicable)

### Installation

```bash
git clone https://github.com/gs-shaykot/HyperReal.git
cd HyperReal
npm install
```

Create a local `.env` file and configure the database connection plus the credentials required by the integrations enabled in your environment. **Never commit secrets.**

Generate Prisma Client and prepare the database using the project's migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development, apply development migrations as appropriate:

```bash
npx prisma migrate dev
```

Seed the database (review `prisma/seed.ts` first):

```bash
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma Client and build the application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run seed:courier-demo` | Seed courier demo data |

## Deployment

The application is deployed on Vercel. Configure the production environment variables and PostgreSQL connection in the deployment settings, ensure Prisma migrations are applied, and then deploy the `main` branch.

The build command runs Prisma Client generation before `next build`.

## Engineering focus

This project demonstrates practical work across:

- Full-stack TypeScript and React development
- Database design and relational modeling with Prisma
- Authentication, authorization, and session lifecycle handling
- Payment integration and payment-state UX
- Checkout idempotency and server-side validation
- Inventory and product-variant modeling
- Order, fulfillment, shipment, and courier workflows
- Return/refund domain modeling and workflow history
- Admin tooling and data-driven interfaces
- Production deployment and build troubleshooting

## Project status

HyperReal is an actively developed portfolio project. Core storefront, commerce, admin, payment, and logistics workflows are implemented; ongoing work includes verification, documentation, edge-case hardening, and polish.

## Screenshots

_Add storefront, product detail, cart/checkout, admin, lookbook, and shipment/return workflow screenshots here._

## Author

**GS Shaykot** — Software Engineer / Full-Stack Developer

- GitHub: [gs-shaykot](https://github.com/gs-shaykot)
- Project: [HyperReal](https://github.com/gs-shaykot/HyperReal)
