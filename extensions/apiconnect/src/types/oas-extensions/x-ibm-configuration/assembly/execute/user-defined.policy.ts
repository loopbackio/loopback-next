/**
 * @internalRemarks
 * Unlike other built-in policies, `user-defined-policy` is not versioned.
 * Hence, the typedef is directly exported without an intermediate versioned
 * typedef such as `V100`. For consistency with the other poliies' typdefs, we
 * are defining a `type` instead of an `interface`.
 *
 * {@see https://www.ibm.com/docs/en/api-connect/10.0.x?topic=execute-user-defined-policies}
 */
export type UserDefinedPolicy = {
  [prop: string]: unknown;
};
