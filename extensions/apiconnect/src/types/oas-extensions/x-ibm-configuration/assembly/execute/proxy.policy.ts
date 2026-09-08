/* eslint-disable @typescript-eslint/naming-convention */
export type ProxyPolicy = DataPowerGateway;

export type DataPowerGateway = V100;

export interface V100 {
  version: string;
  title?: string;
  description?: string;
  'target-url'?: string;
  'tls-profile'?: string;
  /**
   * @defaultVaue `'Keep'`
   */
  verb?:
    | 'Keep'
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS';
  /**
   * @defaultValue `'1.1'`
   */
  'http-version': string;
  /**
   * @defaultValue `60`
   */
  timeout?: number;
  /**
   * @defaultValue: `false`
   */
  compression?: boolean;
  username?: string;
  password?: string;
  output?: string;
  'cache-key'?: string;
  /**
   * @defaultValue `'protocol'`
   */
  'cache-response'?: 'protocol' | 'no-cache' | 'time-to-live';
  /**
   * @defaultValue `false`
   */
  'cache-putpost-response'?: boolean;
  /**
   * @defaultValue '900'
   */
  'cache-ttl'?: number;
  'stop-on-error'?: string[];
}
