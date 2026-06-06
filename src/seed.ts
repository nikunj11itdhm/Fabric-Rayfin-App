/**
 * Seed script — run after deploying to populate sample lakehouse-style data.
 * Usage: npx tsx src/seed.ts
 * Requires VITE_RAYFIN_API_URL and VITE_RAYFIN_PUBLISHABLE_KEY env vars.
 */
import { RayfinClient } from '@microsoft/rayfin-client';

type SeedSchema = { Product: any; Customer: any; Order: any };

const client = new RayfinClient<SeedSchema>({
  baseUrl: process.env.VITE_RAYFIN_API_URL ?? 'http://localhost:5168',
  publishableKey: process.env.VITE_RAYFIN_PUBLISHABLE_KEY ?? '',
});

const categories = ['Electronics', 'Furniture', 'Clothing', 'Food & Beverage', 'Sports'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
const segments = ['Enterprise', 'SMB', 'Consumer', 'Government'];
const statuses = ['Completed', 'Pending', 'Shipped'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('🌱 Seeding products...');
  const productNames = [
    'Laptop Pro 15', 'Wireless Headphones', 'Standing Desk', 'Ergonomic Chair',
    'Running Shoes', 'Smart Watch', 'Coffee Machine', 'LED Monitor 27"',
    'Yoga Mat', 'Protein Powder', 'Winter Jacket', 'Bluetooth Speaker',
  ];
  const products: any[] = [];
  for (const name of productNames) {
    const p = await client.data.Product.create({
      name,
      category: randomFrom(categories),
      price: Math.round(Math.random() * 500 + 20),
      stockQuantity: Math.floor(Math.random() * 200 + 10),
      sku: `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    });
    products.push(p);
    console.log(`  ✔ ${name}`);
  }

  console.log('🌱 Seeding customers...');
  const customerNames = [
    'Contoso Ltd', 'Northwind Traders', 'Adventure Works', 'Fabrikam Inc',
    'Tailspin Toys', 'Wide World Importers', 'Graphic Design Institute',
    'Litware Inc', 'Proseware Inc', 'VanArsdel Ltd',
  ];
  const customers: any[] = [];
  for (const name of customerNames) {
    const c = await client.data.Customer.create({
      name,
      region: randomFrom(regions),
      segment: randomFrom(segments),
      joinedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    });
    customers.push(c);
    console.log(`  ✔ ${name}`);
  }

  console.log('🌱 Seeding orders...');
  for (let i = 0; i < 50; i++) {
    const product = randomFrom(products);
    const customer = randomFrom(customers);
    const qty = Math.floor(Math.random() * 10) + 1;
    await client.data.Order.create({
      quantity: qty,
      totalAmount: qty * product.price,
      status: randomFrom(statuses),
      orderDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      product: { id: product.id },
      customer: { id: customer.id },
    });
  }
  console.log(`  ✔ 50 orders created`);
  console.log('\n✅ Seeding complete! Refresh the dashboard to see your data.');
}

seed().catch(console.error);
