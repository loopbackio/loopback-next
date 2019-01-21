// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component} from '@loopback/core';
import {Lb3ModelBooter} from './boot';

export class CompatComponent implements Component {
  booters = [Lb3ModelBooter];
}
