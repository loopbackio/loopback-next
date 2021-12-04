import * as Assembly from './assembly';

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
  type?: 'rest' | 'wsdl';
  properties?: Properties;
  catalogs?: Catalogs;
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
}

export interface DataPowerAPIGateway
  extends Pick<
    DataPowerGateway,
    | 'phase'
    | 'testable'
    | 'enforced'
    | 'cors'
    | 'type'
    | 'properties'
    | 'catalogs'
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
