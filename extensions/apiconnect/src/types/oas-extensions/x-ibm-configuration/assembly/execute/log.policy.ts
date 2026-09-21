/* eslint-disable @typescript-eslint/naming-convention */
export type LogPolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200 | V210;

export interface V200 {
  version: '2.0.0';
  title?: string;
  description?: string;
  mode: 'gather-only' | 'send-only' | 'gather-and-send';
}

export interface V210 extends Omit<V200, 'version'> {
  version: '2.1.0';
  /**
   * @defaultValue `'default'`
   */
  'log-level'?:
    | 'none'
    | 'activity'
    | 'header'
    | 'payload'
    | 'default'
    | `$(${string})`;
}
