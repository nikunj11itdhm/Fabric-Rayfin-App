import { Product } from './Product.js';
import { Customer } from './Customer.js';
import { Order } from './Order.js';

export type AppSchema = {
  Product: Product;
  Customer: Customer;
  Order: Order;
};
