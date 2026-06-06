import Chart from 'chart.js/auto';

let chartCategory: Chart | null = null;
let chartTime: Chart | null = null;
let chartRegion: Chart | null = null;
let chartStatus: Chart | null = null;

export function renderAllCharts(orders: any[]): void {
  // Update existing charts instead of destroying
  renderCategoryChart(orders);
  renderTimeChart(orders);
  renderRegionChart(orders);
  renderStatusChart(orders);
}

function renderCategoryChart(orders: any[]): void {
  const categoryRevenue: Record<string, number> = {};
  for (const o of orders) {
    const cat = o.product?.category ?? 'Unknown';
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (o.totalAmount || 0);
  }

  const labels = Object.keys(categoryRevenue);
  const data = Object.values(categoryRevenue);
  const colors = ['#0078d4', '#50e6ff', '#00bcf2', '#8661c5', '#e74856', '#ffb900'];

  if (chartCategory) {
    chartCategory.data.labels = labels;
    chartCategory.data.datasets[0].data = data;
    chartCategory.update();
  } else {
    chartCategory = new Chart(document.getElementById('categoryChart') as HTMLCanvasElement, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Revenue ($)', data, backgroundColor: colors, borderRadius: 6 }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }
}

function renderTimeChart(orders: any[]): void {
  const monthlyRevenue: Record<string, number> = {};
  for (const o of orders) {
    const d = new Date(o.orderDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (o.totalAmount || 0);
  }
  const sorted = Object.entries(monthlyRevenue).sort(([a], [b]) => a.localeCompare(b));

  if (chartTime) {
    chartTime.data.labels = sorted.map(([k]) => k);
    chartTime.data.datasets[0].data = sorted.map(([, v]) => v);
    chartTime.update();
  } else {
    chartTime = new Chart(document.getElementById('timeChart') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{ label: 'Monthly Revenue ($)', data: sorted.map(([, v]) => v), borderColor: '#0078d4', backgroundColor: 'rgba(0, 120, 212, 0.1)', fill: true, tension: 0.3 }],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });
  }
}

function renderRegionChart(orders: any[]): void {
  const regionRevenue: Record<string, number> = {};
  for (const o of orders) {
    const region = o.customer?.region ?? 'Unknown';
    regionRevenue[region] = (regionRevenue[region] || 0) + (o.totalAmount || 0);
  }

  const colors = ['#0078d4', '#50e6ff', '#00bcf2', '#8661c5', '#e74856', '#ffb900', '#107c10'];

  if (chartRegion) {
    chartRegion.data.labels = Object.keys(regionRevenue);
    chartRegion.data.datasets[0].data = Object.values(regionRevenue);
    chartRegion.update();
  } else {
    chartRegion = new Chart(document.getElementById('regionChart') as HTMLCanvasElement, {
      type: 'doughnut',
      data: { labels: Object.keys(regionRevenue), datasets: [{ data: Object.values(regionRevenue), backgroundColor: colors }] },
      options: { responsive: true },
    });
  }
}

function renderStatusChart(orders: any[]): void {
  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  const colors = ['#107c10', '#ffb900', '#0078d4', '#e74856'];

  if (chartStatus) {
    chartStatus.data.labels = Object.keys(statusCounts);
    chartStatus.data.datasets[0].data = Object.values(statusCounts);
    chartStatus.update();
  } else {
    chartStatus = new Chart(document.getElementById('statusChart') as HTMLCanvasElement, {
      type: 'pie',
      data: { labels: Object.keys(statusCounts), datasets: [{ data: Object.values(statusCounts), backgroundColor: colors }] },
      options: { responsive: true },
    });
  }
}
