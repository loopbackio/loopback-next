// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {securityId, UserProfile} from '@loopback/security';
import {expect} from '@loopback/testlab';
import {UserProfileFactory} from '../../..';
import {getUserRepository} from '../../fixtures/helper';
import {User} from '../../fixtures/users/user';
import {UserRepository} from '../../fixtures/users/user.repository';

/**
 * This test suite is for testing the
 *
 *   export interface UserProfileFactory<U> {
 *     (user: U): UserProfile;
 *   }
 *
 * interface.
 */
describe('UserProfileFactory', () => {
  let joeUser: User;
  let userProfileFactory1: UserProfileFactory<User>;
  let userProfileFactory2: UserProfileFactory<User>;

  givenUser();
  givenUserProfileFactory1();
  givenUserProfileFactory2();

  it('user profile contains a few fields', () => {
    const expectedUserProfile1 = {
      [securityId]: '1',
      name: 'joe joeman',
      username: 'joe888',
    };

    const userProfile = userProfileFactory1(joeUser);

    // user profile should contain these fields
    expect.exists(userProfile.name);
    expect.exists(userProfile.username);
    expect.exists(userProfile[securityId]);

    // the user profile fields should match the expected user profile fields
    expect(userProfile.name).to.equal(expectedUserProfile1.name);
    expect(userProfile.username).to.equal(expectedUserProfile1.username);
    expect(userProfile[securityId]).to.equal(expectedUserProfile1[securityId]);

    // user profile should not contain these fields
    expect.not.exists(userProfile.firstName);
    expect.not.exists(userProfile.lastName);
    expect.not.exists(userProfile.password);
    expect.not.exists(userProfile.id);
  });

  it(`user profile only contains '[securityId]' field`, () => {
    const expectedUserProfile2 = {
      [securityId]: '1',
    };

    const userProfile = userProfileFactory2(joeUser);

    // user profile should contain this field
    expect.exists(userProfile[securityId]);

    // the user profile field should match the expected user profile field
    expect(userProfile[securityId]).to.equal(expectedUserProfile2[securityId]);

    // user profile should not contain these fields
    expect.not.exists(userProfile.firstName);
    expect.not.exists(userProfile.lastName);
    expect.not.exists(userProfile.password);
    expect.not.exists(userProfile.id);
  });

  function givenUser() {
    const userRepo: UserRepository = getUserRepository();
    joeUser = userRepo.list['joe888'];
  }

  /**
   * This function takes in a User and returns a UserProfile
   * with only these fields:
   *  - [securityId]
   *  - name
   *  - username
   */
  function givenUserProfileFactory1() {
    userProfileFactory1 = function (user: User): UserProfile {
      const userProfile: UserProfile = {
        [securityId]: '',
        name: '',
        username: '',
      };

      if (user.id) userProfile[securityId] = user.id;

      let userName = '';
      if (user.firstName) userName = user.firstName;
      if (user.lastName)
        userName = user.firstName
          ? `${userName} ${user.lastName}`
          : user.lastName;
      userProfile.name = userName;

      if (user.username) userProfile.username = user.username;

      return userProfile;
    };
  }

  /**
   * This function takes in a User and returns a UserProfile
   * with only this field:
   *  - [securityId]
   */
  function givenUserProfileFactory2() {
    userProfileFactory2 = function (user: User): UserProfile {
      const userProfile: UserProfile = {[securityId]: ''};
      if (user.id) userProfile[securityId] = user.id;
      return userProfile;
    };
  }
});
