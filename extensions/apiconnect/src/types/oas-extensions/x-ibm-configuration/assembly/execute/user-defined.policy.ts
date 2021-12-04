export interface UserDefinedPolicy {
  [policy_name: string]: {
    [prop: string]: unknown;
  };
}
