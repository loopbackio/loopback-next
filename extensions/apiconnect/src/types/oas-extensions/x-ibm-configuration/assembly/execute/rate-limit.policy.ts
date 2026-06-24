/* eslint-disable @typescript-eslint/naming-convention */
export type RateLimitPolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200;

export type V200 = {
  version: string;
  title?: string;
  description?: string;
  source: 'catalog-named' | 'plan-named' | 'gateway-named' | 'plan-default';
  operation?: 'consume' | 'replenish' | 'inc' | 'dec'; // No clear documentation on this.
} & (
  | {
      'rate-limit': string[];
      'burst-limit'?: string[];
      'count-limit'?: string[];
    }
  | {
      'rate-limit'?: string[];
      'burst-limit': string[];
      'count-limit'?: string[];
    }
  | {
      'rate-limit'?: string[];
      'burst-limit'?: string[];
      'count-limit': string[];
    }
);
