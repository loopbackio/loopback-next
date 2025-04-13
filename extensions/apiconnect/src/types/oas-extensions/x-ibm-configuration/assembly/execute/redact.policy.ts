export type RedactPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  actions: {
    /**
     * @defaultValue `'redact'`
     */
    action?: 'remove' | 'redact';
    /**
     * @defaultValue `'all'`
     */
    from?: ('all' | 'request' | 'response' | 'logs')[];
    path: string;
  }[];
}

export interface V200 extends Omit<V100, 'version' | 'actions'> {
  version: '2.0.0';
  title?: string;
  description?: string;
  redactions: {
    root?: string;
    path: string;
    /**
     * @defaultValue `'redact'`
     */
    action?: 'redact' | 'remove';
  }[];
}
