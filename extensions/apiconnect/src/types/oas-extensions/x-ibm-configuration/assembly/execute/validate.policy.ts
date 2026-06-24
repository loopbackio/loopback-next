/* eslint-disable @typescript-eslint/naming-convention */
export type ValidatePolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  definition: `#/definitions/${string}` | 'request' | 'response';
}

export type V200 = {
  version: '2.0.0';
  title?: string;
  description?: string;
  input?: string;
  output?: string;
} & (
  | {
      'validate-against'?: 'wsdl' | 'body-param' | 'response-param' | 'graphql';
    }
  | {
      'validate-against': 'definition';
      definition: string;
    }
  | {
      'validate-against': 'url';
      'json-schema': string;
      'xml-validation-mode': 'xsd' | 'wsdl' | 'soap-body';
    }
);
