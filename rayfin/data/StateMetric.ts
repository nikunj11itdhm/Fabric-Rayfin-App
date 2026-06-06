import { entity, uuid, text, decimal, authenticated } from '@microsoft/rayfin-core';

@entity()
@authenticated('*')
export class StateMetric {
  @uuid() id!: string;
  @text({ max: 100 }) stateName!: string;
  @text({ max: 50 }) metric!: string;
  @decimal() value!: number;
}
