/* eslint-disable @typescript-eslint/naming-convention */
export type UserSecurityPolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200;

export type V200 = {
  version: '2.0.0';
  title?: string;
  description?: string;
  'factor-id'?: string;
} & (
  | ({
      'ei-stop-on-error'?: boolean;
    } & ( // Value of `extract-identity-method` dictates the other parameters.
      | {
          'extract-identity-method': 'basic';
        }
      | {
          'extract-identity-method': 'context-var';
          'user-context-var': string;
          'pass-context-var': string;
        }
      | ({
          'extract-identity-method': 'html-form';
          'ei-form-time-limit'?: number;
        } & (
          | {
              'ei-default-form': true;
            }
          | {
              'ei-default-form': false;
              'ei-custom-form': string;
              'ei-custom-form-tls-client-profile': string;
            }
        ))
      | {
          'extract-identity-method': 'redirect';
          'redirect-url': string;
          'redirect-time-limit': number;
        }
    ))
  | {
      'extract-identity-method': 'disabled';
    }
) &
  // `az-stop-on-error` can only be used with `user-az-method`.
  (| ({
        'au-stop-on-error'?: boolean;
      } & ( // Value of `user-auth-method` dictates the other parameters.
        | {
            'user-auth-method': 'auth-url';
            'auth-url': string;
            'auth-tls-client-profile': string;
            'auth-response-headers-pattern': string;
            'auth-response-header-credential': string;
          }
        | {
            'user-auth-method': 'ldap';
            'ldap-registry': string;
          }
      ))
    | {
        'user-auth-method': 'disabled';
      }
  ) &
  (
    | ({'az-stop-on-error': boolean} & (
        | {
            'user-az-method': 'authenticated';
          }
        | ({
            'user-az-method': 'html-form';
          } & (
            | {
                'az-default-form': true;
              }
            | {
                'az-default-form': false;
                'az-table-dynamic-entries': string;
                'az-form-time-limit': number;
              }
          ))
      ))
    | {
        'user-az-method': 'disabled';
      }
  );
