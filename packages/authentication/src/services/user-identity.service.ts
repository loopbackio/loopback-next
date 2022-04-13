// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The User Identity service links a user to profiles from an external source (eg: ldap, oauth2 provider, saml)
 * which can identify the user. The profile typically has the following information:
 *   name, email-id, uuid, roles, authorizations, scope of accessible resources, expiration time for given access
 *
 * @example
 *  export class LDAPUserIdentityService implements UserIdentityService<LDAPUserIdentity, UserProfile> {
 *    constructor(
 *      @repository(UserRepository)
 *      public userRepository: UserRepository,
 *      @repository(UserIdentityRepository)
 *      public userIdentityRepository: UserIdentityRepository,
 *    ) {}
 *  }
 */
export interface UserIdentityService<I, U> {
  /**
   * find or create a local user using a profile from an external source
   * @param userIdentity
   *
   * @example
   *    async findOrCreateUser(
   *      ldapUser: LDAPUserIdentity,
   *    ): Promise<UserProfile> {
   *      let user: UserProfile = await this.userRepository.findOrCreate({
   *        name: ldapUser.cn,
   *        username: ldapUser.mail,
   *        roles: _.map(ldapUser.memberof['ou=roles,dc=mydomain,o=myOrg'], 'cn')
   *      });
   *      await this.linkExternalProfile(user.id, ldapUser);
   *      return user;
   *    }
   */
  findOrCreateUser(userIdentity: I): Promise<U>;

  /**
   * link an external profile with an existing local user id.
   * @param userId
   *
   * @example
   *    async linkExternalProfile(userId: string, ldapUser: LDAPUserIdentity) {
   *      return await this.userIdentityRepository.findOrCreate({
   *        provider: 'ldap',
   *        externalId: ldapUser.id,
   *        authScheme: 'active-directory',
   *        userId: userId,
   *        credentials: {
   *          distinguishedName: ldapUser.dn,
   *          roles: ldapUser.memberof,
   *          expirationTime: ldapUser.maxAge}
   *      });
   *    }
   *  }
   */
  linkExternalProfile(userId: string, userIdentity: I): Promise<U>;
}
