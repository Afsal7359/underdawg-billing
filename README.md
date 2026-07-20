# NexBill — Billing & Inventory PWA

A fast, installable billing app for retail stores. iOS-style design, white theme, works offline once installed. Full-stack: a React PWA frontend backed by a **Node.js + Express + MongoDB** REST API.

## Features

- **New bill** — search or barcode-scan items, quantity steppers, discount, GST (5%), Cash / UPI / Card / Credit, partial payments
- **Barcode system** — live camera scanning (BarcodeDetector API), manual code entry, demo "simulate scan", auto-generated printable barcodes for every item and invoice
- **Orders** — filterable invoice list (Paid / Due / Overdue), full receipt view, collect-payment flow
- **Accounts (khata)** — customer & supplier ledgers, to-collect / to-pay totals, record payments
- **Expenses** — record & manage business expenses (rent, salaries, utilities…), category breakdown, feeds the P&L statement
- **Reports** — 7D / 30D / 12M revenue charts, category split, top items, payment modes, plus Sales, Item-wise, Party, GST, Stock and P&L statements — all computed server-side from live data
- **Settings** — editable store profile (name, owner, address, GSTIN) printed on receipts
- **PWA** — installable on Android & iOS, offline app shell via service worker, safe-area aware

## Quick start

Requires **Node 18+** and a running **MongoDB** (`mongodb://127.0.0.1:27017` by default).

```bash
# 1. Install both apps (frontend + server)
npm run setup            # = npm install && npm --prefix server install

# 2. Seed the database with demo data (products, parties, orders, expenses)
npm run seed

# 3. Start the API (terminal 1)
npm run server           # http://localhost:4000

# 4. Start the PWA (terminal 2)
npm run dev              # http://localhost:5173  (proxies /api → :4000)
```

Open **http://localhost:5173**. The frontend loads everything from the API on start; all data persists in MongoDB.

Production:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

Sanity check (server-renders every screen):

```bash
npm run check
```

## Installing as an app

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, nginx…). **HTTPS is required** for both the service worker and the camera — `localhost` also works during development.

- **Android / Chrome:** open the site → ⋮ menu → *Add to Home screen* (or the install prompt).
- **iOS / Safari:** Share → *Add to Home Screen*. (iOS Safari doesn't expose BarcodeDetector; the scanner automatically falls back to manual entry + simulate mode.)

## Project structure

```
src/
  main.jsx              entry
  App.jsx               state, actions (createOrder, recordPayment, addExpense…), API loading, routing
  lib/
    theme.js            colors, CSS, formatters (₹, dates), tax rate, daily-series helper
    api.js              ★ REST client — bootstrap + all reads/writes to the backend
    data.js             seed constants (still used by the offline SSR render check)
  components/
    ui.jsx              design system: Card, Btn, Sheet, Toast, BarcodeView, …
  screens/
    Home.jsx  Orders.jsx  Bill.jsx  Accounts.jsx  Reports.jsx  Products.jsx  Expenses.jsx
public/icons/           PWA icon set
vite.config.js          Vite + vite-plugin-pwa + /api dev proxy
```

## Backend (`server/`)

Express + Mongoose API. All frontend state is loaded from `GET /api/bootstrap` and every mutation goes through these endpoints:

```
server/src/
  index.js              boot: connect Mongo + listen
  app.js                express app, CORS, routes, error handler
  config.js  db.js       env config + mongoose connection
  seed.js               ★ npm run seed — products, parties, curated + generated orders, expenses, 12-month baseline
  models/               Product, Party, Order, Payment, Expense, Counter, MonthlyStat, Settings
  routes/               bootstrap, products, parties, orders, payments, expenses, reports, settings
```

| Method & path                     | Purpose                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| `GET  /api/bootstrap`             | Everything the app needs on load                               |
| `POST /api/orders`                | Create a bill — computes totals/GST, decrements stock, updates the party's khata |
| `GET  /api/orders`                | Recent invoices                                                |
| `POST /api/payments`              | Record a payment against an invoice **or** a party balance     |
| `GET/POST /api/products` · `PATCH /api/products/:id/stock` | Catalogue + stock adjust           |
| `GET/POST /api/parties`           | Customers & suppliers (khata)                                  |
| `GET/POST/PATCH/DELETE /api/expenses` | Expense management                                         |
| `GET  /api/reports/overview?period=7D\|30D\|12M` | Revenue series, KPIs, category / top-item / payment-mode breakdowns |
| `GET/PATCH /api/settings`         | Store profile                                                  |

Configure via `server/.env` (see `server/.env.example`): `PORT`, `MONGODB_URI`, `CORS_ORIGIN`.

## Notes

- Camera scanning uses the native `BarcodeDetector` API (Chrome / Edge / Android WebView). Elsewhere the scanner still works via manual entry and simulate mode.
- Data now persists in MongoDB. Run `npm run seed` any time to reset to a clean demo state.
- `npm run check` server-renders every screen (including Expenses) as a fast smoke test — it uses `src/lib/data.js` seed constants so it needs no running server.
