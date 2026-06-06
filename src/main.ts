import { client, isProduction } from './api';
import { state } from './state';
import { getFilteredOrders, populateSlicerOptions, resetSlicers } from './filters';
import { renderAllCharts } from './charts';
import { renderKPIs, renderOrdersTable, showLoading, showError, updateLastRefreshed } from './ui';
import { renderIndiaMap } from './india-map';

// Sample data for development only
function generateSampleData() {
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverage', 'Sports'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const statuses: Array<'Completed' | 'Pending' | 'Shipped'> = ['Completed', 'Pending', 'Shipped'];
  const productNames = [
    'Laptop Pro 15', 'Wireless Headphones', 'Standing Desk', 'Ergonomic Chair',
    'Running Shoes', 'Smart Watch', 'Coffee Machine', 'LED Monitor 27"',
    'Yoga Mat', 'Protein Powder', 'Winter Jacket', 'Bluetooth Speaker',
  ];
  const customerNames = [
    'Contoso Ltd', 'Northwind Traders', 'Adventure Works', 'Fabrikam Inc',
    'Tailspin Toys', 'Wide World Importers', 'Graphic Design Institute',
    'Litware Inc', 'Proseware Inc', 'VanArsdel Ltd',
  ];

  const products = productNames.map((name, i) => ({
    id: `p-${i}`, name, category: categories[i % categories.length],
    price: Math.round(Math.random() * 500 + 30), stockQuantity: Math.floor(Math.random() * 200 + 10),
  }));

  const customers = customerNames.map((name, i) => ({
    id: `c-${i}`, name, region: regions[i % regions.length], segment: 'Enterprise',
  }));

  const orders = Array.from({ length: 60 }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const qty = Math.floor(Math.random() * 10) + 1;
    return {
      id: `o-${i}`, quantity: qty, totalAmount: qty * product.price,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      product: { name: product.name, category: product.category, price: product.price },
      customer: { name: customer.name, region: customer.region },
    };
  }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return { orders, products, customers };
}

async function loadDashboard() {
  showLoading();
  state.isLoading = true;

  try {
    const [orders, products, customers] = await Promise.all([
      client.data.Order.select([
        'id', 'quantity', 'totalAmount', 'status', 'orderDate',
        'product_id', 'product.name', 'product.category', 'product.price',
        'customer_id', 'customer.name', 'customer.region',
      ]).orderBy({ orderDate: 'desc' }).execute(),
      client.data.Product.select(['id', 'name', 'category', 'price', 'stockQuantity']).execute(),
      client.data.Customer.select(['id', 'name', 'region', 'segment']).execute(),
    ]);
    state.orders = orders;
    state.products = products;
    state.customers = customers;
    state.error = null;
  } catch (err) {
    if (isProduction()) {
      state.error = 'Unable to connect to data backend. Please try again later.';
      showError(state.error);
      state.isLoading = false;
      return;
    }
    // Development mode: use sample data with visible indicator
    console.warn('[DEV] Backend unavailable, using sample data');
    const sample = generateSampleData();
    state.orders = sample.orders;
    state.products = sample.products;
    state.customers = sample.customers;
    state.error = null;
    const banner = document.getElementById('dev-banner');
    if (banner) banner.style.display = 'block';
  }

  state.isLoading = false;
  state.lastRefreshed = new Date();
  populateSlicerOptions();
  applyFiltersAndRender();
  updateLastRefreshed();
}

function applyFiltersAndRender() {
  const filtered = getFilteredOrders();
  renderKPIs(filtered, state.products, state.customers);
  renderAllCharts(filtered);
  renderOrdersTable(filtered);
}

// Wire up slicer change events
function initSlicers() {
  const ids = ['slicer-category', 'slicer-region', 'slicer-status', 'slicer-date-from', 'slicer-date-to'];
  ids.forEach(id => {
    document.getElementById(id)!.addEventListener('change', applyFiltersAndRender);
  });

  document.getElementById('slicer-reset')!.addEventListener('click', () => {
    resetSlicers();
    applyFiltersAndRender();
  });
}

// Tab switching
let mapRendered = false;
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    const target = (tab as HTMLElement).dataset.tab!;
    document.getElementById(`tab-${target}`)!.classList.add('active');

    if (target === 'india-map' && !mapRendered) {
      mapRendered = true;
      renderIndiaMap('india-map-container');
    }
  });
});

// Map slicer events
document.getElementById('slicer-map-metric')!.addEventListener('change', () => {
  document.getElementById('india-map-container')!.innerHTML = '';
  renderIndiaMap('india-map-container');
});
document.getElementById('slicer-map-zone')!.addEventListener('change', () => {
  document.getElementById('india-map-container')!.innerHTML = '';
  renderIndiaMap('india-map-container');
});

initSlicers();
loadDashboard();
