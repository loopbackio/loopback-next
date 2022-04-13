// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserIdentityService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {Profile as PassportProfile} from 'passport';
import {User} from '../models';

export namespace UserServiceBindings {
  export const PASSPORT_USER_IDENTITY_SERVICE = BindingKey.create<
    UserIdentityService<PassportProfile, User>
  >('services.passport.identity');
}
