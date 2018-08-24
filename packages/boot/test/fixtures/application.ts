// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {BootMixin} from '../../index';

export class BooterApp extends RepositoryMixin(BootMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
  }
}
