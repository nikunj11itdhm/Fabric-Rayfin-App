import { entity, uuid, text, int, decimal, date, one, authenticated } from '@microsoft/rayfin-core';
import { Product } from './Product.js';
import { Customer } from './Customer.js';

@entity()
@authenticated('*')
export class Order {
  @uuid() id!: string;
  @int() quantity!: number;
  @decimal() totalAmount!: number;
  @text({ max: 50 }) status!: string;
  @date() orderDate!: Date;
  @uuid() product_id!: string;
  @one(() => Product) product?: Product;
  @uuid() customer_id!: string;
  @one(() => Customer) customer?: Customer;
}
