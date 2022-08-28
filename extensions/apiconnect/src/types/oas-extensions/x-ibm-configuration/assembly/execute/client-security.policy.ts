/* eslint-disable @typescript-eslint/naming-convention */
export type ClientSecurityPolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200;

export interface V200 {
  version: '2.0.0';
  title?: string;
  description?: string;
  'stop-on-error': boolean;
  'secret-required': boolean;
  'extract-credential-method':
    | 'header'
    | 'query'
    | 'form'
    | 'cookie'
    | 'http'
    | 'context-var';
  'id-name'?: string;
  'secret-name'?: string;
  'http-type'?: 'basic';
  'client-auth-method': 'native' | 'third-party';
  'user-registry': string;
}
