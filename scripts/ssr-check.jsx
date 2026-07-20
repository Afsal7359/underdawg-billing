import "./ssr-setup.js";
import { renderToString } from "react-dom/server";
import App from "../src/App.jsx";
import { SEED_PRODUCTS, SEED_CUSTOMERS, SEED_ORDERS } from "../src/lib/data.js";
import { HomeScreen, NotificationsSheet } from "../src/screens/Home.jsx";
import { OrdersScreen, OrderDetailScreen } from "../src/screens/Orders.jsx";
import { BillScreen, ScannerModal, SuccessSheet, CustomerPickerSheet } from "../src/screens/Bill.jsx";
import { AccountsScreen, AccountDetailScreen, PaymentSheet, AddCustomerSheet } from "../src/screens/Accounts.jsx";
import { ReportsScreen, ReportSheet } from "../src/screens/Reports.jsx";
import { ProductsScreen, ProductSheet, AddProductSheet, SettingsSheet } from "../src/screens/Products.jsx";
import { ExpensesScreen, ExpenseSheet } from "../src/screens/Expenses.jsx";

const noop = () => {};
const SEED_EXPENSES = [
  { id: "e1", title: "Shop rent — July", category: "Rent", amount: 18000, mode: "UPI", note: "", date: new Date() },
  { id: "e2", title: "Staff salary", category: "Salaries", amount: 14000, mode: "Cash", note: "", date: new Date() },
];
const SETTINGS = { storeName: "NexBill Store", owner: "Arjun V", address: "MG Road, Bengaluru", gstin: "29ABCDE1234F1Z5", phone: "+91 98765 43210", taxRate: 5 };
const base = {
  tab: "home", setTab: noop, stack: [], push: noop, pop: noop, toast: noop,
  products: SEED_PRODUCTS, customers: SEED_CUSTOMERS, orders: SEED_ORDERS, extraPay: {},
  expenses: SEED_EXPENSES, settings: SETTINGS, walkId: "c5",
  cart: { p1: 2, p3: 1 }, setCart: noop, addToCart: noop, removeFromCart: noop,
  billCustomer: "c1", setBillCustomer: noop, billDisc: "", setBillDisc: noop,
  billTax: true, setBillTax: noop, billMode: "Cash", setBillMode: noop, billRecv: "", setBillRecv: noop,
  createOrder: noop, recordPayment: noop, setStock: noop, addProduct: noop, addCustomer: noop,
  addExpense: noop, editExpense: noop, deleteExpense: noop, saveSettings: noop,
  scan: { open: true, ctx: "bill" }, openScanner: noop, closeScanner: noop, sheet: {}, setSheet: noop,
};
const S = (over = {}) => ({ ...base, ...over });
const oid = SEED_ORDERS[0].id;

const cases = [
  ["App", <App />],
  ["Home", <HomeScreen S={S()} />],
  ["Notifications", <NotificationsSheet S={S({ sheet: { notifications: true } })} />],
  ["Orders", <OrdersScreen S={S()} />],
  ["OrderDetail", <OrderDetailScreen S={S()} id={oid} />],
  ["Bill", <BillScreen S={S()} />],
  ["Scanner", <ScannerModal S={S()} />],
  ["Success", <SuccessSheet S={S({ sheet: { success: oid } })} />],
  ["Picker", <CustomerPickerSheet S={S({ sheet: { picker: true } })} />],
  ["Accounts", <AccountsScreen S={S()} />],
  ["AccountDetail", <AccountDetailScreen S={S()} id="c1" />],
  ["PaymentOrder", <PaymentSheet S={S({ sheet: { payment: { kind: "order", id: oid } } })} />],
  ["PaymentAcct", <PaymentSheet S={S({ sheet: { payment: { kind: "account", id: "c1" } } })} />],
  ["AddCustomer", <AddCustomerSheet S={S({ sheet: { addCustomer: true } })} />],
  ["Reports", <ReportsScreen S={S()} />],
  ...["sales","items","party","gst","stock","pnl"].map((t) => [
    "Report:" + t, <ReportSheet S={S({ sheet: { report: t } })} />
  ]),
  ["Products", <ProductsScreen S={S()} />],
  ["ProductSheet", <ProductSheet S={S({ sheet: { product: "p1" } })} />],
  ["AddProduct", <AddProductSheet S={S({ sheet: { addProduct: { code: "8901234" } } })} />],
  ["Settings", <SettingsSheet S={S({ sheet: { settings: true } })} />],
  ["Expenses", <ExpensesScreen S={S()} />],
  ["ExpenseNew", <ExpenseSheet S={S({ sheet: { expense: {} } })} />],
  ["ExpenseEdit", <ExpenseSheet S={S({ sheet: { expense: SEED_EXPENSES[0] } })} />],
];

let fail = 0;
for (const [name, el] of cases) {
  try {
    const html = renderToString(el);
    if (!html || html.length < 20) throw new Error("empty output");
    console.log("PASS", name, `(${html.length} chars)`);
  } catch (e) {
    fail++;
    console.log("FAIL", name, "->", e.message);
  }
}
if (fail) { console.log(fail + " failures"); process.exit(1); }
console.log("ALL " + cases.length + " RENDER CHECKS PASSED");
