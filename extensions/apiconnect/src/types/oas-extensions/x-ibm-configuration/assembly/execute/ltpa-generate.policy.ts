/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @internalRemarks
 * Unlike other built-in policies, `ltpa-generate` is not versioned. Hence, the
 * typedef is directly exported without an intermediate versioned typedef such
 * as `V100`. For consistency with the other poliies' typdefs, we are defining
 * a `type` instead of an `interface`.
 *
 * {@see https://www.ibm.com/docs/en/api-connect/5.0.x?topic=execute-ltpa-generate-generate-ltpa-token}
 */
export type LTPAGeneratePolicy = {
  title: string;
  description?: string;
  /**
   * @example Implicitly select version `1.0.0` of `my-ltpa-key` LTPA key
   * ```typescript
   * 'my-ltpa-key'
   * ```
   *
   * @example Select version `2.0.0` of `my-ltpa-key` LTPA key
   * ```typescript
   * 'my-ltpa-key:2.0.0'
   * ```
   *
   * @example Select latest version of `my-ltpa-key` LTPA key at runtime
   *
   * The automatic version selection feature relies on the LTPA key being
   * configured with a version number that conforms to the
   * `version.release.modification` version numbering scheme.
   *
   * ```typescript
   * 'my-ltpa-key:latest'
   * ```
   */
  key: string;
  authenticatedUserName: string;
  /**
   * @defaultValue `'WebSphereVersion2'`
   */
  tokenVersion?: TokenVersion;
  /**
   * @defaultalue `'In Cookie Header'`
   */
  tokenOutput?: TokenOutput;
  /**
   * @defaultValue `600`
   */
  tokenExpiry?: number;
};

export const enum TokenVersion {
  WebSphereVersion1,
  'WebSphereVersion1-FIPS',
  WebSphereVersion2,
  WebSphere70Version2,
}

export const enum TokenOutput {
  'In Cookie Header',
  'In WSSec Header',
}
