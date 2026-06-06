// Sanitize text to prevent XSS when rendering into innerHTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function renderKPIs(orders: any[], products: any[], customers: any[]): void {
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

export function renderOrdersTable(orders: any[]): void {
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
      <td>${escapeHtml(new Date(o.orderDate).toLocaleDateString())}</td>
      <td>${escapeHtml(o.product?.name ?? '—')}</td>
      <td>${escapeHtml(o.customer?.name ?? '—')}</td>
      <td>${escapeHtml(o.customer?.region ?? '—')}</td>
      <td>$${(o.totalAmount || 0).toLocaleString()}</td>
      <td><span class="status-badge ${statusClass}">${escapeHtml(o.status)}</span></td>
    </tr>`;
  }).join('');
}

export function showLoading(): void {
  document.getElementById('kpi-row')!.innerHTML = `
    <div class="kpi-card"><div class="label">Loading</div><div class="value" style="font-size:1rem;color:#666;">⏳ Fetching data...</div></div>
  `;
  document.getElementById('orders-table')!.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
}

export function showError(message: string): void {
  document.getElementById('kpi-row')!.innerHTML = `
    <div class="kpi-card" style="grid-column: 1/-1;">
      <div class="label" style="color:#e74856;">Error</div>
      <div class="value" style="font-size:0.9rem;color:#333;">${escapeHtml(message)}</div>
      <button onclick="window.location.reload()" style="margin-top:10px;padding:6px 16px;background:#0078d4;color:#fff;border:none;border-radius:6px;cursor:pointer;">Retry</button>
    </div>
  `;
}

export function updateLastRefreshed(): void {
  const el = document.getElementById('last-refreshed');
  if (el) {
    el.textContent = `Last refreshed: ${new Date().toLocaleTimeString()}`;
  }
}
