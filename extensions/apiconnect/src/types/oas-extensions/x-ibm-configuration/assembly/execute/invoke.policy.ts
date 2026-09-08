/* eslint-disable @typescript-eslint/naming-convention */
export type InvokePolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200 | V210 | V220 | V230;
export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  'target-url': string;
  'tls-profile'?: string;
  /**
   * @defaultValue `'GET'`
   */
  verb?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  /**
   * @defaultValue `60`
   */
  timeout?: number;
  /**
   * @defaultValue `false`
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
   * @remarks
   * Valid range: 5-31708800
   * @defaultValue `900`
   */
  'cache-ttl'?: number;
  'stop-on-error'?: string[];
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
  /**
   * @defaultValue `'detect'`
   */
  'backend-type'?: 'detect' | 'xml' | 'json' | 'binary' | 'graphql';
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
   * @defaultValue `false`
   */
  'keep-payload'?: boolean;
  /**
   * @defaultValue `false`
   */
  'use-http-10'?: boolean;
  /**
   * @defaultValue `true`
   */
  'chunked-uploads'?: boolean;
  /**
   * @defaultValue
   * ```typescript
   * {
   *   type: 'blacklist',
   *   values: [],
   * }
   * ```
   */
  'header-control'?: {
    type: 'blacklist' | 'whitelist';
    values: string[];
  };
  /**
   * @defaultValue
   * ```typescript
   * {
   *   type: 'whitelist',
   *   values: [],
   * }
   * ```
   */
  'parameter-control'?: {
    type: 'blacklist' | 'whitelist';
    values: string[];
  };
  'follow-redirect'?: boolean;
}

export type V210 = Omit<V200, 'version'> & {
  version: '2.1.0';
  /**
   * @deprecated Use {@link WebSocketUpgrade} instead.
   */
  'websocket-upgrade'?: boolean;
} & (
    | {
        'http-version': 'HTTP/1.0' | 'HTTP/1.1';
      }
    | {
        'http-version': 'HTTP/2';
        'http2-required'?: boolean;
      }
  );

export type V220 =
  | (Omit<V210, 'version'> & {version: '2.2.0'})
  | (Omit<V210, 'version' | 'verb' | 'backend-type'> & {
      version: '2.2.0';
      'graphql-send-type': 'detect' | 'graphql' | 'json';
      'backend-type': 'graphql' | 'detect';
      verb: 'Keep' | 'POST';
    });

export type V230 = Omit<V220, 'version'> & {
  version: '2.3.0';
  /**
   * @defaultValue `true`
   */
  'persistent-connection'?: boolean;
};
