import { state } from './state';

export function getFilteredOrders(): any[] {
  const category = (document.getElementById('slicer-category') as HTMLSelectElement).value;
  const region = (document.getElementById('slicer-region') as HTMLSelectElement).value;
  const status = (document.getElementById('slicer-status') as HTMLSelectElement).value;
  const dateFrom = (document.getElementById('slicer-date-from') as HTMLInputElement).value;
  const dateTo = (document.getElementById('slicer-date-to') as HTMLInputElement).value;

  return state.orders.filter(o => {
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

export function populateSlicerOptions(): void {
  const categories = [...new Set(state.orders.map(o => o.product?.category).filter(Boolean))].sort();
  const regions = [...new Set(state.orders.map(o => o.customer?.region).filter(Boolean))].sort();
  const statuses = [...new Set(state.orders.map(o => o.status).filter(Boolean))].sort();

  const catSelect = document.getElementById('slicer-category') as HTMLSelectElement;
  const regSelect = document.getElementById('slicer-region') as HTMLSelectElement;
  const statusSelect = document.getElementById('slicer-status') as HTMLSelectElement;

  // Clear existing options beyond "All"
  catSelect.innerHTML = '<option value="">All Categories</option>';
  regSelect.innerHTML = '<option value="">All Regions</option>';
  statusSelect.innerHTML = '<option value="">All Statuses</option>';

  categories.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSelect.appendChild(opt); });
  regions.forEach(r => { const opt = document.createElement('option'); opt.value = r; opt.textContent = r; regSelect.appendChild(opt); });
  statuses.forEach(s => { const opt = document.createElement('option'); opt.value = s; opt.textContent = s; statusSelect.appendChild(opt); });
}

export function resetSlicers(): void {
  (document.getElementById('slicer-category') as HTMLSelectElement).value = '';
  (document.getElementById('slicer-region') as HTMLSelectElement).value = '';
  (document.getElementById('slicer-status') as HTMLSelectElement).value = '';
  (document.getElementById('slicer-date-from') as HTMLInputElement).value = '';
  (document.getElementById('slicer-date-to') as HTMLInputElement).value = '';
}
