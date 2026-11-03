/**
 * Local definition for OpenAPI specification extensions (vendor extensions starting with 'x-').
 * Defined locally in repository-json-schema to avoid creating an upward dependency
 * on higher-level packages like @loopback/openapi-v3.
 */
export interface SpecificationExtension {
  [key: `x-${string}`]: unknown;
}
