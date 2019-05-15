// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/security
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {Subject, UserProfile} from './types';

/**
 * Binding keys for security related metadata
 */
export namespace SecurityBindings {
  /**
   * Binding key for subject
   */
  export const SUBJECT = BindingKey.create<Subject>('security.subject');

  /**
   * Binding key for current user profile
   */
  export const USER = BindingKey.create<UserProfile>('security.user');
}
