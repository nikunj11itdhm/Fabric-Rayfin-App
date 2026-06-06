import { entity, uuid, text, decimal, int, authenticated } from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class Product {
  @uuid() id!: string;
  @text({ max: 200 }) name!: string;
  @text({ max: 100 }) category!: string;
  @decimal() price!: number;
  @int() stockQuantity!: number;
  @text({ max: 50 }) sku!: string;
}
