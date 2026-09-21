/* eslint-disable @typescript-eslint/naming-convention */
import {
  DataPowerAPIGateway as ExecuteDataPowerAPIGateway,
  V200 as ExecuteV200,
  V200Min,
} from '.';

export type WebSocketUpgradePolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway<
  ET extends V200Min = ExecuteDataPowerAPIGateway,
> = V200<ET>;

export interface V200<ET extends V200Min = ExecuteV200> {
  version: '2.0.0';
  title?: string;
  description?: string;
  target: string;
  'tls-profile'?: string;
  /**
   * @defaultValue `60`
   */
  timeout?: number;
  'follow-redirects'?: boolean;
  username?: string;
  password?: string;
  /**
   * @defaultValue `false`
   */
  'inject-proxy-headers'?: boolean;
  /**
   * @defaultValue `false`
   */
  'decode-request-params'?: boolean;
  /**
   * @defaultValue `false`
   */
  'encode-plus-char'?: boolean;
  /**
   * @defaultValue
   * ```typescript
   * {
   *   type: 'blocklist',
   *   values: [],
   * }
   * ```
   */
  'header-control'?: {
    type: 'blocklist' | 'allowlist';
    values: string[];
  };
  /**
   * @defaultValue
   * ```typescript
   * {
   *   type: 'blocklist',
   *   values: [],
   * }
   * ```
   */
  'parameter-control'?: {
    type: 'blocklist' | 'allowlist';
    values: string[];
  };
  'request-assembly'?: {
    execute: Pick<ET, 'parse' | 'ratelimit' | 'validate'>;
  };
  'response-assembly'?: {
    execute: ET;
  };
}
