/* eslint-disable @typescript-eslint/naming-convention */
export type JWTGenerate = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;
export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  jwt?: string;
  'jti-claim'?: boolean;
  /**
   * @defaultValue `'iss.claim'`
   */
  'iss-claim'?: string; // #TODO: Confirm is mandatory. Default is "iss.claim"
  'sub-claim'?: string;
  'aud-claim'?: string;
  /**
   * @defaultValue `3600`
   */
  'exp-claim'?: number; // #TODO: Confirm is mandatory. Default is 3600.
  'private-claims'?: string;
  'jws-jwk'?: string;
  'jws-alg'?:
    | 'HS256'
    | 'HS384'
    | 'HS512'
    | 'RS256'
    | 'RS384'
    | 'RS512'
    | 'ES256'
    | 'ES384'
    | 'ES512'
    | 'PS256'
    | 'PS384'
    | 'PS512';
  'jws-crypto'?: string;
  'jws-enc'?: 'A128CBC-HS256' | 'A192CBC-HS384' | 'A256CBC-HS512';
  'jwe-jwk'?: string;
  'jwe-alg'?:
    | 'RSA1_5'
    | 'RSA-OAEP'
    | 'RSA-OAEP-256'
    | 'dir'
    | 'A128KW'
    | 'A192KW'
    | 'A256KW';
  'jwe-crypto': string;
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
}
