import { entity, uuid, text, date, authenticated } from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class Customer {
  @uuid() id!: string;
  @text({ max: 200 }) name!: string;
  @text({ max: 100 }) region!: string;
  @text({ max: 100 }) segment!: string;
  @date() joinedAt!: Date;
}
