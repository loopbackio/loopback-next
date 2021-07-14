// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {RESOURCE_ID} from '../../../keys';

/**
 * Instance level authorizer for known endpoints
 * - 'projects/{id}/show-balance'
 * - 'projects/{id}/donate'
 * - 'projects/{id}/withdraw'
 * This function is used to modify the authorization context.
 * It is not used for making a decision, so just returns ABSTAIN
 * @param authorizationCtx
 * @param metadata
 */
export async function assignProjectInstanceId(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
) {
  const projectId = authorizationCtx.invocationContext.args[0];
  const resourceId = getResourceName(
    metadata.resource ?? authorizationCtx.resource,
    projectId,
  );
  // resourceId will override the resource name from metadata
  authorizationCtx.invocationContext.bind(RESOURCE_ID).to(resourceId);
  return AuthorizationDecision.ABSTAIN;
}

/**
 * Generate the resource name according to the naming convention
 * in casbin policy
 * @param resource resource name
 * @param id resource instance's id
 */
function getResourceName(resource: string, id?: number): string {
  // instance level name
  if (id) return `${resource}${id}`;
  // class level name
  return `${resource}*`;
}
