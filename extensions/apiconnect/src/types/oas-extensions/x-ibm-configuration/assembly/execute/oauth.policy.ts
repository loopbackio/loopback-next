/* eslint-disable @typescript-eslint/naming-convention */
export type OAuthPolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200;

export interface V200 {
  version: '2.0.0';
  title?: string;
  description?: string;
  'oauth-provider-settings-ref'?: {
    default: string;
    url?: string;
    literal?: string;
  };
  'supported-oauth-components'?: (
    | 'OAuthGenerateAZCode'
    | 'OAuthGenerateAccessToken'
    | 'OAuthIntrospectToken'
    | 'OAuthVerifyAZCode'
    | 'OAuthVerifyRefreshToken'
  )[];
}
