/* eslint-disable @typescript-eslint/naming-convention */
export type ActivityLogPolicy = DataPowerGateway;

export type DataPowerGateway = V100;

export interface V100 {
  version: '1.0.0';
  title: string;
  description?: string;
  content: 'none' | 'activity' | 'header' | 'payload';
  'error-content': 'none' | 'activity' | 'header' | 'payload';
}
