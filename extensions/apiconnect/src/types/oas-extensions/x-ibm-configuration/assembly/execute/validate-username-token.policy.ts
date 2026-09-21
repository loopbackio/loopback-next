/* eslint-disable @typescript-eslint/naming-convention */
export type ValidateUsernameTokenPolicy = DataPowerGateway;

export type DataPowerGateway = V100 | V110;

export type V100 = {
  version: '1.0.0';
  title: string;
  description?: string;
} & (
  | {
      'auth-type': 'Authentication URL';
      'auth-url': string;
      'tls-profile'?: string;
    }
  | {
      'auth-type': 'LDAP Registry';
      'ldap-registry': string;
      'ldap-search-attribute': string;
    }
);

export type V110 = Omit<
  V100,
  'version' | 'auth-type' | 'auth-url' | 'tls-profile' | 'ldap-registry'
> & {
  version: '2.0.0';
  title: string;
  registry: string;
};
