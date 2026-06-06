import { Product } from './Product.js';
import { Customer } from './Customer.js';
import { Order } from './Order.js';
import { StateMetric } from './StateMetric.js';

export type AppSchema = {
  Product: Product;
  Customer: Customer;
  Order: Order;
  StateMetric: StateMetric;
};
