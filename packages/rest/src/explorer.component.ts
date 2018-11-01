// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component} from '@loopback/core';

export class ExplorerComponent implements Component {
  staticAssets = [
    {
      path: '/explorer1',
      rootDir: './public',
      options: {},
    },
  ];
}
