/* eslint-disable @typescript-eslint/naming-convention */

export type ParsePolicy = DataPowerAPIGateway;

export type DataPowerAPIGateway = V200;

export interface V200 {
  version: string;
  title?: string;
  description?: string;
  /**
   * @defaultValue `false`
   */
  'use-content-type'?: boolean;
  'parse-settings-reference'?: {
    default?: unknown;
    literal?: string;
    url?: string;
  };
  document_type?: 'detect' | 'JSON' | 'XML' | 'graphql';
  /**
   * @remarks
   * Valid range: 0-5368709121
   * @defaultValue `0`
   */
  max_doc_size?: number;
  /**
   * @remarks
   * Valid range: 0-4096
   * @defaultValue `0`
   */
  max_nesting_depth?: number;
  /**
   * @remarks
   * Valid range: 0-8192
   * @defaultValue `0`
   */
  max_width?: number;
  /**
   * @remarks
   * Valid range: 0-8192
   * @defaultValue `0`
   */
  max_name_length?: number;
  /**
   * @remarks
   * Valid range: 0-5368709121
   * @defaultValue `0`
   */
  max_value_length?: number;
  /**
   * @remarks
   * Valid range: 0-1048575
   * @defaultValue `0`
   */
  max_unique_names?: number;
  /**
   * @remarks
   * Valid range: 0-262143
   * @defaultValue `0`
   */
  max_unique_prefixes?: number;
  /**
   * @remarks
   * Valid range: 0-65535
   * @defaultValue `0`
   */
  max_unique_namespaces?: number;
  /**
   * @remarks
   * Valid range: 0-256
   * @defaultValue `0`
   */
  max_number_length?: number;
  input?: string;
  output?: string;
}
