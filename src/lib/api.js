/* ==================================================================
 *  underdawg Bill API client
 *  Talks to the billing API that lives inside the underdawg service
 *  (oneBackend gateway → /underdwag/api/billing). Same port, same
 *  database and the same product catalogue as the website.
 *
 *  Auth: a billing-staff JWT is kept in localStorage and sent as a
 *  Bearer token on every request. Accounts are created by an admin in
 *  the website admin panel.
 * ================================================================== */

const BASE = (import.meta.env?.VITE_API_URL || "/api/billing").replace(/\/$/, "");

const TOKEN_KEY = "nexbill_token";
const USER_KEY = "nexbill_user";

export const auth = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  get user() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  },
  save(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || null));
    } catch { /* private mode — session stays in memory only */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
  },
};

/** Raised when the server rejects our token, so the UI can bounce to login. */
export class AuthError extends Error {}

async function req(path, { method = "GET", body, noAuth } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const t = auth.token;
  if (t && !noAuth) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (res.status === 401 || res.status === 403) {
    auth.clear();
    throw new AuthError((data && data.error) || "Please sign in again");
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

/* Orders/payments/expenses carry dates; hydrate ISO strings into Date objects
   so the UI's date maths (sorting, rel(), fT()) keeps working. */
const hydrateOrder = (o) => ({ ...o, date: new Date(o.date) });
const hydratePayment = (p) => ({ ...p, date: new Date(p.date) });
const hydrateExpense = (e) => ({ ...e, date: new Date(e.date) });

export const api = {
  base: BASE,

  /* ----------------------------------------------------------- auth -- */
  async login(email, password) {
    const r = await req("/auth/login", {
      method: "POST",
      body: { email, password },
      noAuth: true,
    });
    auth.save(r.token, r.user);
    return r.user;
  },
  logout() { auth.clear(); },
  me: () => req("/auth/me"),

  // One call to hydrate the whole app.
  async bootstrap() {
    const b = await req("/bootstrap?orders=400");
    const extraPay = {};
    for (const p of b.payments || []) {
      (extraPay[p.party] = extraPay[p.party] || []).push(hydratePayment(p));
    }
    return {
      products: b.products || [],
      categories: b.categories || [],
      customers: b.parties || [],
      orders: (b.orders || []).map(hydrateOrder),
      extraPay,
      expenses: (b.expenses || []).map(hydrateExpense),
      settings: b.settings || {},
      user: b.user || null,
    };
  },

  // Orders
  async createOrder(payload) {
    const r = await req("/orders", { method: "POST", body: payload });
    return { order: hydrateOrder(r.order), products: r.products || [], party: r.party || null };
  },

  // Bin a bill: type 'deleted' (billed in error) or 'returned' (goods back).
  // Both restore stock and unwind the customer's balance; nothing is destroyed.
  voidOrder: (id, type, reason) =>
    req(`/orders/${id}/void`, { method: "POST", body: { type, reason } }).then((r) => ({
      order: hydrateOrder(r.order), products: r.products || [], party: r.party || null,
    })),
  restoreOrder: (id) =>
    req(`/orders/${id}/restore`, { method: "POST" }).then((r) => ({
      order: hydrateOrder(r.order), products: r.products || [], party: r.party || null,
    })),

  // Payments
  recordPayment: (target, amt, mode) =>
    req("/payments", { method: "POST", body: { target, amt, mode } }).then((r) => ({
      order: r.order ? hydrateOrder(r.order) : null,
      party: r.party || null,
      payment: r.payment ? hydratePayment(r.payment) : null,
    })),

  // Products
  addProduct: (obj) => req("/products", { method: "POST", body: obj }),
  setStock: (id, delta, size) => req(`/products/${id}/stock`, { method: "PATCH", body: { delta, size } }),
  editProduct: (id, obj) => req(`/products/${id}`, { method: "PATCH", body: obj }),
  productByCode: (code) => req(`/products/by-code/${encodeURIComponent(code)}`),

  // Parties
  addCustomer: (obj) => req("/parties", { method: "POST", body: obj }),

  // Expenses
  addExpense: (obj) => req("/expenses", { method: "POST", body: obj }).then(hydrateExpense),
  editExpense: (id, obj) => req(`/expenses/${id}`, { method: "PATCH", body: obj }).then(hydrateExpense),
  deleteExpense: (id) => req(`/expenses/${id}`, { method: "DELETE" }),

  // Reports
  reportOverview: (period) => req(`/reports/overview?period=${period}`),

  // Settings
  saveSettings: (obj) => req("/settings", { method: "PATCH", body: obj }),
};
