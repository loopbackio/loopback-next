// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {prop, Ref} from '@typegoose/typegoose';
import Event from './event.schema';
import User from './user.schema';

export default class LoginEvent extends Event {
  @prop({ref: 'User'})
  _user: Ref<User>;
}
