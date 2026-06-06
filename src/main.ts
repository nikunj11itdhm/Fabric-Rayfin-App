import { RayfinClient } from '@microsoft/rayfin-client';
import type { AppSchema } from '../rayfin/data/schema';
import Chart from 'chart.js/auto';

const client = new RayfinClient<AppSchema>({
  baseUrl: import.meta.env.VITE_RAYFIN_API_URL ?? 'http://localhost:5168',
  publishableKey: import.meta.env.VITE_RAYFIN_PUBLISHABLE_KEY ?? '',
});

// Store raw data globally for filtering
let allOrders: any[] = [];
let allProducts: any[] = [];
let allCustomers: any[] = [];

// Chart instances for destroy/re-render
let chartCategory: Chart | null = null;
let chartTime: Chart | null = null;
let chartRegion: Chart | null = null;
let chartStatus: Chart | null = null;

function generateSampleData() {
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverage', 'Sports'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const statuses = ['Completed', 'Pending', 'Shipped'];
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
  try {
    [allOrders, allProducts, allCustomers] = await Promise.all([
      client.data.Order.select([
        'id', 'quantity', 'totalAmount', 'status', 'orderDate',
        'product_id', 'product.name', 'product.category', 'product.price',
        'customer_id', 'customer.name', 'customer.region',
      ]).orderBy({ orderDate: 'desc' }).execute(),
      client.data.Product.select(['id', 'name', 'category', 'price', 'stockQuantity']).execute(),
      client.data.Customer.select(['id', 'name', 'region', 'segment']).execute(),
    ]);
  } catch {
    const sample = generateSampleData();
    allOrders = sample.orders;
    allProducts = sample.products;
    allCustomers = sample.customers;
  }

  populateSlicerOptions();
  applyFiltersAndRender();
}

function populateSlicerOptions() {
  const categories = [...new Set(allOrders.map(o => o.product?.category).filter(Boolean))].sort();
  const regions = [...new Set(allOrders.map(o => o.customer?.region).filter(Boolean))].sort();
  const statuses = [...new Set(allOrders.map(o => o.status).filter(Boolean))].sort();

  const catSelect = document.getElementById('slicer-category') as HTMLSelectElement;
  const regSelect = document.getElementById('slicer-region') as HTMLSelectElement;
  const statusSelect = document.getElementById('slicer-status') as HTMLSelectElement;

  categories.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSelect.appendChild(opt); });
  regions.forEach(r => { const opt = document.createElement('option'); opt.value = r; opt.textContent = r; regSelect.appendChild(opt); });
  statuses.forEach(s => { const opt = document.createElement('option'); opt.value = s; opt.textContent = s; statusSelect.appendChild(opt); });
}

function getFilteredOrders(): any[] {
  const category = (document.getElementById('slicer-category') as HTMLSelectElement).value;
  const region = (document.getElementById('slicer-region') as HTMLSelectElement).value;
  const status = (document.getElementById('slicer-status') as HTMLSelectElement).value;
  const dateFrom = (document.getElementById('slicer-date-from') as HTMLInputElement).value;
  const dateTo = (document.getElementById('slicer-date-to') as HTMLInputElement).value;

  return allOrders.filter(o => {
    if (category && o.product?.category !== category) return false;
    if (region && o.customer?.region !== region) return false;
    if (status && o.status !== status) return false;
    if (dateFrom) {
      const orderMonth = o.orderDate.substring(0, 7);
      if (orderMonth < dateFrom) return false;
    }
    if (dateTo) {
      const orderMonth = o.orderDate.substring(0, 7);
      if (orderMonth > dateTo) return false;
    }
    return true;
  });
}

function applyFiltersAndRender() {
  const filtered = getFilteredOrders();

  // Destroy existing charts
  chartCategory?.destroy(); chartCategory = null;
  chartTime?.destroy(); chartTime = null;
  chartRegion?.destroy(); chartRegion = null;
  chartStatus?.destroy(); chartStatus = null;

  renderKPIs(filtered, allProducts, allCustomers);
  chartCategory = renderCategoryChart(filtered);
  chartTime = renderTimeChart(filtered);
  chartRegion = renderRegionChart(filtered);
  chartStatus = renderStatusChart(filtered);
  renderOrdersTable(filtered);
}

// Wire up slicer change events
function initSlicers() {
  const ids = ['slicer-category', 'slicer-region', 'slicer-status', 'slicer-date-from', 'slicer-date-to'];
  ids.forEach(id => {
    document.getElementById(id)!.addEventListener('change', applyFiltersAndRender);
  });

  document.getElementById('slicer-reset')!.addEventListener('click', () => {
    (document.getElementById('slicer-category') as HTMLSelectElement).value = '';
    (document.getElementById('slicer-region') as HTMLSelectElement).value = '';
    (document.getElementById('slicer-status') as HTMLSelectElement).value = '';
    (document.getElementById('slicer-date-from') as HTMLInputElement).value = '';
    (document.getElementById('slicer-date-to') as HTMLInputElement).value = '';
    applyFiltersAndRender();
  });
}

function renderKPIs(orders: any[], products: any[], customers: any[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  document.getElementById('kpi-row')!.innerHTML = `
    <div class="kpi-card"><div class="label">Total Revenue</div><div class="value">$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
    <div class="kpi-card"><div class="label">Total Orders</div><div class="value">${totalOrders}</div></div>
    <div class="kpi-card"><div class="label">Avg Order Value</div><div class="value">$${avgOrderValue.toFixed(0)}</div></div>
    <div class="kpi-card"><div class="label">Products</div><div class="value">${products.length}</div></div>
    <div class="kpi-card"><div class="label">Customers</div><div class="value">${customers.length}</div></div>
  `;
}

function renderCategoryChart(orders: any[]): Chart {
  const categoryRevenue: Record<string, number> = {};
  for (const o of orders) {
    const cat = o.product?.category ?? 'Unknown';
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (o.totalAmount || 0);
  }

  return new Chart(document.getElementById('categoryChart') as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels: Object.keys(categoryRevenue),
      datasets: [{
        label: 'Revenue ($)',
        data: Object.values(categoryRevenue),
        backgroundColor: ['#0078d4', '#50e6ff', '#00bcf2', '#8661c5', '#e74856', '#ffb900'],
        borderRadius: 6,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function renderTimeChart(orders: any[]): Chart {
  const monthlyRevenue: Record<string, number> = {};
  for (const o of orders) {
    const d = new Date(o.orderDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (o.totalAmount || 0);
  }
  const sorted = Object.entries(monthlyRevenue).sort(([a], [b]) => a.localeCompare(b));

  return new Chart(document.getElementById('timeChart') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Monthly Revenue ($)',
        data: sorted.map(([, v]) => v),
        borderColor: '#0078d4',
        backgroundColor: 'rgba(0, 120, 212, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}

function renderRegionChart(orders: any[]): Chart {
  const regionRevenue: Record<string, number> = {};
  for (const o of orders) {
    const region = o.customer?.region ?? 'Unknown';
    regionRevenue[region] = (regionRevenue[region] || 0) + (o.totalAmount || 0);
  }

  return new Chart(document.getElementById('regionChart') as HTMLCanvasElement, {
    type: 'doughnut',
    data: {
      labels: Object.keys(regionRevenue),
      datasets: [{
        data: Object.values(regionRevenue),
        backgroundColor: ['#0078d4', '#50e6ff', '#00bcf2', '#8661c5', '#e74856', '#ffb900', '#107c10'],
      }],
    },
    options: { responsive: true },
  });
}

function renderStatusChart(orders: any[]): Chart {
  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  return new Chart(document.getElementById('statusChart') as HTMLCanvasElement, {
    type: 'pie',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#107c10', '#ffb900', '#0078d4', '#e74856'],
      }],
    },
    options: { responsive: true },
  });
}

function renderOrdersTable(orders: any[]) {
  const tbody = document.getElementById('orders-table')!;
  const recent = orders.slice(0, 15);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No orders match the selected filters</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(o => {
    const statusClass = o.status === 'Completed' ? 'status-completed'
      : o.status === 'Pending' ? 'status-pending' : 'status-shipped';
    return `<tr>
      <td>${new Date(o.orderDate).toLocaleDateString()}</td>
      <td>${o.product?.name ?? '—'}</td>
      <td>${o.customer?.name ?? '—'}</td>
      <td>${o.customer?.region ?? '—'}</td>
      <td>$${(o.totalAmount || 0).toLocaleString()}</td>
      <td><span class="status-badge ${statusClass}">${o.status}</span></td>
    </tr>`;
  }).join('');
}

import { renderIndiaMap } from './india-map';

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
  mapRendered = false;
  document.getElementById('india-map-container')!.innerHTML = '';
  mapRendered = true;
  renderIndiaMap('india-map-container');
});
document.getElementById('slicer-map-zone')!.addEventListener('change', () => {
  mapRendered = false;
  document.getElementById('india-map-container')!.innerHTML = '';
  mapRendered = true;
  renderIndiaMap('india-map-container');
});

initSlicers();
loadDashboard();
