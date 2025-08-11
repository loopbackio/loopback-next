/* eslint-disable @typescript-eslint/naming-convention */
export type JWTValidatePolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: 'V100';
  title: string;
  description?: string;
  jwt: string;
  /**
   * @defaultValue `'decoded.claims'`
   */
  'output-claims'?: string; // #TODO: Confirm if mandatory. Default value is "decoded.claims"
  'iss-claim'?: string;
  'aud-claim'?: string;
  'jwe-crypto'?: string;
  'jwe-jwk'?: string;
  'jws-crypto'?: string;
  'jws-jwk'?: string;
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
}
