/* eslint-disable @typescript-eslint/naming-convention */
export type ThrowPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200 | V210;

export interface V100 {
  version: '1.0.0';
  title?: string;
  name: string;
  message?: string;
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
}

export interface V210 extends Omit<V200, 'version'> {
  version: '2.1.0';
  title?: string;
  name: string;
  'error-status-code'?: number;
  'error-status-reason'?: string;
  message?: string;
}
