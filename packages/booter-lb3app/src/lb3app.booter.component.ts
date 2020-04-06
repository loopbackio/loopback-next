// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component} from '@loopback/core';
import {Lb3AppBooter} from './lb3app.booter';

export class Lb3AppBooterComponent implements Component {
  booters = [Lb3AppBooter];
}
