// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {TypeOrmMixin} from '../../';

export class TypeOrmApp extends BootMixin(TypeOrmMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
  }
}
