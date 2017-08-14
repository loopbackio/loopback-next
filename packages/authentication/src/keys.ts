// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  export const STRATEGY = 'authentication.strategy';
  export const AUTH_ACTION = 'authentication.actions.authenticate';
  export const METADATA = 'authentication.operationMetadata';
  export const CURRENT_USER = 'authentication.currentUser';
}
