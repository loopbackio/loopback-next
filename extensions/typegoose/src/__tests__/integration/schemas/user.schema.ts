// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {prop} from '@typegoose/typegoose';

/**
 * Define Typegoose classes first
 */
export default class User {
  @prop()
  firstName: string;

  @prop()
  lastName: string;
}
