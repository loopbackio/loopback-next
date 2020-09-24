// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {securityId, UserProfile} from '@loopback/security';
import {pick} from 'lodash';

// Example:
//   @authorize({
//     allowedRoles: [RoleEnum.admin],
//     voters: [basicAuthorization],
//   })
//   @delete('/profile/{id}}', {
//     responses: {
//       '204': {
//         description: 'Profile reset success',
//       },
//     },
//   })
//   async resetById(
//     @param.path.number('id') id?: number,
//   ): Promise<void> {
//     await this.profileRepository.deleteById(id);
//   }
// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function roleBasedAuthorization(
  authorizationCtx: AuthorizationContext,
  decoratorMetadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    const user = pick(authorizationCtx.principals[0], [
      'id',
      'name',
      'email',
      'roles',
    ]);
    currentUser = {
      [securityId]: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    } as UserProfile;
  } else {
    return AuthorizationDecision.DENY;
  }

  if (!currentUser.roles) {
    return AuthorizationDecision.DENY;
  }

  if (!decoratorMetadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  for (const role of currentUser.roles) {
    if (decoratorMetadata.allowedRoles!.includes(role)) {
      return AuthorizationDecision.ALLOW;
    }
  }

  return AuthorizationDecision.DENY;
}
