export type MapPolicy = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200;

export interface IO {
  [key: string]: {
    schema: {type: string} | {$ref: string};
    variable: string;
    content: 'application/xml' | 'application/json';
  };
}

export interface V100 {
  version: '1.0.0';
  title?: string;
  description?: string;
  inputs?: IO;
  outputs?: IO;
  actions: {
    from?: string;
    value?: string;
    default?: string;
    foreach?: string;
  } & (
    | {
        set: string;
      }
    | {
        create: string;
      }
  );
  options?: {
    /**
     * @defaultValue `false`
     */
    includeEmptyXMLElements?: boolean;
    /**
     * @defaultValue `true`
     */
    namespaceInheritance?: boolean;
    /**
     * @defaultValue `true`
     */
    inlineNamespaces?: boolean;
    mapResolveXMLInputDataType?: boolean;
    mapXMLEmptyElement?: 'string' | null;
    messagesInputData?: 'error' | 'warn' | 'info';
  };
}

export interface V200 extends Omit<V100, 'version'> {
  version: '2.0.0';
  mapXMLEmptyElement?:
    | 'string'
    | 'null'
    | 'string-badgerfish'
    | 'null-badgerfish';
  /**
   * @defaultValue `false`
   */
  mapArrayFirstElementValue?: boolean;
  /**
   * @defaultValue `true`
   */
  mapResolveApicVariables?: boolean;
  /**
   * @defaultValue `false`
   */
  mapNullValue?: boolean;
  /**
   * @defaultValue `false`
   */
  mapOptimizeSchemaDefinition?: boolean;
  /**
   * @defaultValue `false`
   */
  mapEmulateV4DefaultRequiredProps?: boolean;
  /**
   * @defaultValue `false`
   */
  mapEnablePostProcessingJSON?: boolean;
  /**
   * @defaultValue `'all'`
   */
  mapCreateEmptyArray?: 'all' | 'parent' | 'none';
  /**
   * @remarks
   * Valid range: 1-5
   * @defaultValue `1`
   */
  mapReferenceLimit?: number;
  /**
   * @defaultValue `false`
   */
  mapEmulateV4EmptyJSONObject?: boolean;
}
