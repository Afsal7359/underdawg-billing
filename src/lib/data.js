import { Bar } from "recharts";
import { dAgo, fD, rel, TAX } from "./theme.js";

export const CATEGORIES = ["Beverages", "Snacks", "Dairy", "Grocery", "Personal Care", "Household"];

export const SEED_PRODUCTS = [
  { id: "p1",  name: "Coca-Cola 750ml",     cat: "Beverages",     price: 45,  cost: 32,  stock: 48, code: "8901030300011", emoji: "🥤" },
  { id: "p2",  name: "Amul Milk 1L",        cat: "Dairy",         price: 66,  cost: 60,  stock: 25, code: "8901030300028", emoji: "🥛" },
  { id: "p3",  name: "Lays Classic 90g",    cat: "Snacks",        price: 30,  cost: 22,  stock: 64, code: "8901030300035", emoji: "🍟" },
  { id: "p4",  name: "Tata Salt 1kg",       cat: "Grocery",       price: 28,  cost: 24,  stock: 80, code: "8901030300042", emoji: "🧂" },
  { id: "p5",  name: "Maggi Noodles 4-pack",cat: "Snacks",        price: 60,  cost: 48,  stock: 42, code: "8901030300059", emoji: "🍜" },
  { id: "p6",  name: "Dove Soap 100g",      cat: "Personal Care", price: 55,  cost: 44,  stock: 36, code: "8901030300066", emoji: "🧼" },
  { id: "p7",  name: "Red Label Tea 500g",  cat: "Beverages",     price: 240, cost: 205, stock: 18, code: "8901030300073", emoji: "🍵" },
  { id: "p8",  name: "Aashirvaad Atta 5kg", cat: "Grocery",       price: 265, cost: 242, stock: 14, code: "8901030300080", emoji: "🌾" },
  { id: "p9",  name: "Surf Excel 1kg",      cat: "Household",     price: 140, cost: 118, stock: 22, code: "8901030300097", emoji: "🧺" },
  { id: "p10", name: "Britannia Bread",     cat: "Dairy",         price: 45,  cost: 36,  stock: 12, code: "8901030300103", emoji: "🍞" },
  { id: "p11", name: "Colgate 200g",        cat: "Personal Care", price: 95,  cost: 78,  stock: 40, code: "8901030300110", emoji: "🪥" },
  { id: "p12", name: "Fortune Oil 1L",      cat: "Grocery",       price: 152, cost: 138, stock: 26, code: "8901030300127", emoji: "🫒" },
  { id: "p13", name: "KitKat 4-Finger",     cat: "Snacks",        price: 35,  cost: 27,  stock: 55, code: "8901030300134", emoji: "🍫" },
  { id: "p14", name: "Vim Bar 300g",        cat: "Household",     price: 25,  cost: 19,  stock: 5,  code: "8901030300141", emoji: "🧽" },
  { id: "p15", name: "Amul Butter 500g",    cat: "Dairy",         price: 275, cost: 252, stock: 8,  code: "8901030300158", emoji: "🧈" },
  { id: "p16", name: "Sprite 2.25L",        cat: "Beverages",     price: 95,  cost: 74,  stock: 30, code: "8901030300165", emoji: "🥤" },
];

export const SEED_CUSTOMERS = [
  { id: "c1",  name: "Rahul Sharma",         phone: "+91 98765 43210", type: "customer", bal: 2450,   hue: "#0A6CFF" },
  { id: "c2",  name: "Priya Patel",          phone: "+91 91234 56780", type: "customer", bal: 0,      hue: "#8E4DFF" },
  { id: "c3",  name: "Amit Traders",         phone: "+91 99887 76655", type: "customer", bal: 5200,   hue: "#F59300" },
  { id: "c4",  name: "Sneha Reddy",          phone: "+91 90909 80807", type: "customer", bal: 850,    hue: "#2BA84A" },
  { id: "c5",  name: "Walk-in Customer",     phone: "—",               type: "customer", bal: 0,      hue: "#8E8E93", walk: true },
  { id: "c6",  name: "Kiran Kumar",          phone: "+91 88776 65544", type: "customer", bal: 0,      hue: "#FF3B30" },
  { id: "c9",  name: "Anita Desai",          phone: "+91 97788 12345", type: "customer", bal: 1200,   hue: "#5AC8FA" },
  { id: "c7",  name: "Mehta Distributors",   phone: "+91 98220 11223", type: "supplier", bal: -12400, hue: "#0B0B0F" },
  { id: "c8",  name: "Fresh Farms Supply",   phone: "+91 96655 44332", type: "supplier", bal: -3600,  hue: "#2BA84A" },
  { id: "c10", name: "Global Mart Wholesale",phone: "+91 90112 23344", type: "supplier", bal: 0,      hue: "#F59300" },
];

export const RAW_ORDERS = [
  { d: 0,  t: "18:42", c: "c1", it: [["p1", 2], ["p3", 3], ["p13", 2]], mode: "UPI",    pay: 1 },
  { d: 0,  t: "15:12", c: "c5", it: [["p5", 2], ["p2", 1], ["p10", 1]], mode: "Cash",   pay: 1 },
  { d: 0,  t: "11:05", c: "c4", it: [["p8", 1], ["p4", 2], ["p12", 1]], disc: 15, mode: "Credit", pay: 0 },
  { d: 1,  t: "19:20", c: "c3", it: [["p9", 2], ["p6", 4], ["p11", 2]], disc: 20, mode: "UPI",    pay: 1 },
  { d: 1,  t: "13:41", c: "c5", it: [["p16", 1], ["p13", 4]],           mode: "Cash",   pay: 1 },
  { d: 1,  t: "10:02", c: "c9", it: [["p7", 1], ["p15", 1]],            mode: "Card",   pay: 0.5 },
  { d: 2,  t: "17:55", c: "c2", it: [["p2", 2], ["p10", 2], ["p15", 1]],mode: "UPI",    pay: 1 },
  { d: 2,  t: "12:18", c: "c6", it: [["p5", 3], ["p1", 1]],             mode: "Cash",   pay: 1 },
  { d: 3,  t: "18:30", c: "c1", it: [["p12", 2], ["p8", 1]],  disc: 10, mode: "Credit", pay: 0.5 },
  { d: 4,  t: "16:44", c: "c5", it: [["p3", 5], ["p13", 3], ["p1", 2]], mode: "UPI",    pay: 1 },
  { d: 5,  t: "14:25", c: "c4", it: [["p6", 2], ["p11", 1]],            mode: "Cash",   pay: 1 },
  { d: 6,  t: "19:05", c: "c3", it: [["p8", 2], ["p4", 4], ["p9", 1]], disc: 25, mode: "UPI", pay: 1 },
  { d: 8,  t: "12:50", c: "c9", it: [["p2", 3], ["p10", 2]],            mode: "Credit", pay: 0 },
  { d: 10, t: "17:15", c: "c5", it: [["p14", 4], ["p9", 1]],            mode: "Cash",   pay: 1 },
  { d: 12, t: "11:30", c: "c3", it: [["p7", 2], ["p12", 3]],  disc: 30, mode: "Credit", pay: 0 },
  { d: 15, t: "16:08", c: "c2", it: [["p15", 2], ["p2", 2]],            mode: "UPI",    pay: 1 },
  { d: 18, t: "13:22", c: "c1", it: [["p1", 6], ["p16", 2]],            mode: "Card",   pay: 1 },
  { d: 22, t: "18:40", c: "c6", it: [["p5", 4], ["p3", 2], ["p13", 1]], mode: "Cash",   pay: 1 },
];

let __num = 1068;
export const SEED_ORDERS = RAW_ORDERS.map((r, i) => {
  const items = r.it.map(([pid, qty]) => {
    const p = SEED_PRODUCTS.find((x) => x.id === pid);
    return { pid, name: p.name, emoji: p.emoji, price: p.price, qty };
  });
  const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
  const disc = r.disc || 0;
  const tax = Math.round((sub - disc) * TAX / 100);
  const total = sub - disc + tax;
  const paid = Math.round(total * (r.pay ?? 1));
  const date = dAgo(r.d);
  if (r.t) { const [h, m] = r.t.split(":"); date.setHours(+h, +m); }
  const status = paid >= total ? "paid" : paid > 0 ? "partial" : r.d > 7 ? "overdue" : "pending";
  return { id: "o" + i, no: "INV-" + __num--, cid: r.c, items, sub, disc, tax, total, paid, mode: r.mode, date, status };
});

export const DAILY = Array.from({ length: 30 }, (_, i) => {
  const d = dAgo(29 - i); const wk = d.getDay();
  let v = 7200 + Math.sin(i / 3.1) * 1800 + ((i * 7919) % 997) * 2.2;
  if (wk === 0 || wk === 6) v += 2600;
  return { label: fD(d), v: Math.round(v) };
});
DAILY[29].v = SEED_ORDERS.filter((o) => rel(o.date) === "Today").reduce((s, o) => s + o.total, 0);
DAILY[28].v = SEED_ORDERS.filter((o) => rel(o.date) === "Yesterday").reduce((s, o) => s + o.total, 0) || DAILY[28].v;

export const MONTHLY = [
  { label: "Aug", v: 186000 }, { label: "Sep", v: 204500 }, { label: "Oct", v: 238000 },
  { label: "Nov", v: 252400 }, { label: "Dec", v: 296800 }, { label: "Jan", v: 231500 },
  { label: "Feb", v: 242900 }, { label: "Mar", v: 274300 }, { label: "Apr", v: 259700 },
  { label: "May", v: 287600 }, { label: "Jun", v: 301200 }, { label: "Jul", v: 168400 },
];

/* ================================================================== */
/*  PRIMITIVES                                                         */
/* ================================================================== */

