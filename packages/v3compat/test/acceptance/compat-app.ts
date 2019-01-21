// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {RestApplication, RestServerConfig} from '@loopback/rest';
import {givenHttpServerConfig} from '@loopback/testlab';
import {CompatMixin} from '../..';

export class CompatApp extends CompatMixin(BootMixin(RestApplication)) {}

export async function createCompatApplication() {
  const rest: RestServerConfig = Object.assign({}, givenHttpServerConfig());
  return new CompatApp({rest});
}
