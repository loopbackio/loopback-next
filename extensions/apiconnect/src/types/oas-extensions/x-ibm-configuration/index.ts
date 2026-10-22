/* eslint-disable @typescript-eslint/naming-convention */
import * as XIBMAPIConnectWSDL from '../x-ibm-apiconnect-wsdl';
import * as Assembly from './assembly';

/**
 * @remarks
 * Unlike the built-in policies it contians, X-IBM-Configuration isn't
 * versioned. This means there are no version-based types such as `V100`, but
 * only gateway-based types.
 */
export type XIBMConfiguration = DataPowerGateway | DataPowerAPIGateway;

export interface DataPowerGateway {
  phase: 'identified' | 'specified' | 'realized';
  testable?: boolean;
  enforced?: boolean;
  cors?: {
    enabled: boolean;
  };
  assembly?: Assembly.DataPowerGateway;
  gateway?: 'datapower-gateway';
  type?: 'rest' | 'wsdl' | 'oauth2';
  'x-ibm-apiconnect-wsdl'?: XIBMAPIConnectWSDL.XIBMAPIConnectWSDL;
  'wsdl-definition'?: {
    wsdl: string;
    service?: string;
    port?: string;
    'soap-version': string;
    'parser-version'?: string;
  };
  oauth2?: OAuth2;
  properties?: Properties;
  catalogs?: Catalogs;
  attachments?: Attachment[];
  externalDocs?: ExternalDoc[];
  /**
   * @remarks
   * {@see https://www.ibm.com/docs/en/api-connect/10.0.x?topic=cli-referring-extension-in-api-definition}
   *
   * @example
   * ```typescript
   * {
   *   extensions: {
   *     banking: '1.0.0'
   *   }
   * }
   * ```
   */
  extensions?: {[extensionName: string]: string};
  categories?: string[];
}

export interface DataPowerAPIGateway
  extends Pick<
    DataPowerGateway,
    | 'phase'
    | 'testable'
    | 'enforced'
    | 'cors'
    | 'type'
    | 'x-ibm-apiconnect-wsdl'
    | 'wsdl-definition'
    | 'oauth2'
    | 'properties'
    | 'catalogs'
    | 'attachments'
    | 'externalDocs'
    | 'extensions'
    | 'categories'
  > {
  assembly?: Assembly.DataPowerAPIGateway;
  gateway?: 'datapower-api-gateway';
  /**
   * @example Use defaults
   * ```typescript
   * {
   *   version: '1.0.0',
   *   title: 'default activity logging',
   * }
   * ```
   *
   * @example No logging for successful calls
   * ```typescript
   * {
   *   version: '1.0.0',
   *   title: 'no logging for successful calls',
   *   content: 'none',
   *   'error-content': 'activity',
   * }
   * ```
   */
  'activity-log'?: ActivityLog;
}

export interface ActivityLog {
  version: string;
  title: string;
  description?: string;
  /**
   * @defaultValue `'activity'`
   */
  'success-content': 'none' | 'activity' | 'header' | 'payload';
  /**
   * @defaultValue `'payload'`
   */
  'error-content': 'none' | 'activity' | 'header' | 'payload';
  enabled?: boolean;
}

export interface Properties {
  [prop: string]: {
    value?: string;
    description?: string;
    encoded?: boolean;
  };
}

export interface Catalogs {
  [catalogName: string]: {
    properties: Record<string, unknown>;
  };
}

export interface URLWithTLSProfile {
  url: string;
  'tls-profile'?: string;
}

export interface OAuth2 {
  'client-type'?: 'public' | 'confidential';
  scopes?: Record<string, string>;
  'scope-validators'?: {
    application?: URLWithTLSProfile;
    owner?: URLWithTLSProfile;
  };
  grants?: ('application' | 'password' | 'accessCode' | 'implicit')[];
  'identity-extraction'?: {
    /**
     * @defaultValue `'default-form'`
     */
    type: 'default-form' | 'basic' | 'custom-form' | 'redirect';
    'redirect-url'?: string;
    'custom-form'?: URLWithTLSProfile;
  };
  authentication?: {
    'x-ibm-authentication-registry'?: string;
    'x-ibm-authentication-url'?: URLWithTLSProfile;
  };
  authorization?: {
    /**
     * @defaultValue `'authenticated'`
     */
    type: 'default-form' | 'custom-form' | 'authenticated';
    'custom-form'?: URLWithTLSProfile;
  };
  'access-token'?: {
    /**
     * @remarks
     * Range: 1-63244800
     *
     * @defaultValue `3600`
     */
    ttl?: number;
  };
  'refresh-token'?: {
    /**
     * @remarks
     * Range: 0-4096
     *
     * @defaultValue `0`
     */
    count: number;
    /**
     * @remarks
     * Range: 2-252979200
     *
     * @defaultValue `2682000`
     */
    ttl?: number;
  };
  'maximum-consent'?: {
    /**
     * @remarks
     * Range: 0-2529792000
     *
     * @defaultValue `0`
     */
    ttl?: number;
  };
  revocation?:
    | {
        /**
         * @defaultValue `'url'`
         */
        type?: 'url';
        url: string;
        'tls-profile'?: string;
      }
    | {
        type: 'gateway';
      };
  metadata?: {
    'metadata-url'?: URLWithTLSProfile;
  };
}

export interface Attachment {
  id: string;
  title?: string;
  description?: string;
}

export interface ExternalDoc {
  title?: string;
  description?: string;
  url: string;
}
