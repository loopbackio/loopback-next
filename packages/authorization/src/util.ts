import {Principal, securityId, UserProfile} from '@loopback/security';

// This is a workaround before we specify `TypedPrincipal` instead of
// `Principal` for the principals in the authorization context.

/**
 * Module `@loopback/authentication` passes a user profile to
 * `@loopback/authorization` as the user identity. Authorization verifies
 * whether a user has access to a certain resource.
 *
 * The builder function:
 * - preserves all the fields from user profile
 * - specifies 'USER' as type
 * - assign the value of `securityId` to name if it's missing in the
 * user profile
 * @param user The user profile passed from `@loopback/authentication`.
 */
export function createPrincipalFromUserProfile(user: UserProfile): Principal {
  return {
    ...user,
    name: user.name || user[securityId],
    type: 'USER',
  };
}
