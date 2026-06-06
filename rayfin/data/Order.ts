import { entity, uuid, int, decimal, date, one, set, authenticated } from '@microsoft/rayfin-core';
import { Product } from './Product.js';
import { Customer } from './Customer.js';

@entity()
@authenticated('*')
export class Order {
  @uuid() id!: string;
  @int() quantity!: number;
  @decimal() totalAmount!: number;
  @set('Completed', 'Pending', 'Shipped', 'Cancelled')
  status!: 'Completed' | 'Pending' | 'Shipped' | 'Cancelled';
  @date() orderDate!: Date;
  @uuid() product_id!: string;
  @one(() => Product) product?: Product;
  @uuid() customer_id!: string;
  @one(() => Customer) customer?: Customer;
}
