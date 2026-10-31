export type IfPolicy = DataPowerGateway;

export type DataPowerGateway = V100;

export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  condition: string;
  execute: string;
}
