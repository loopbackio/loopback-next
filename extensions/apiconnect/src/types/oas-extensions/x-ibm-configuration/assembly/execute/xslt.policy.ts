/* eslint-disable @typescript-eslint/naming-convention */
export type XSLTPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: string;
  title: string;
  description?: string;
  /**
   * @defaultValue `false`
   */
  input?: boolean;
  source: string;
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
  /**
   * @defaultValue `false`
   */
  'serialize-output'?: boolean;
}
