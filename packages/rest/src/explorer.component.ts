// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component} from './types';
import * as path from 'path';

export class ExplorerComponent implements Component {
  staticAssets = [
    {
      path: '/explorer1',
      rootDir: './public', //path.resolve(__dirname, '../../../explorer'),
      options: {},
    },
  ];
}
