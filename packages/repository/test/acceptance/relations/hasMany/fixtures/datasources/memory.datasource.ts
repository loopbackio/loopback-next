import {DataSourceConstructor, juggler} from '../../../../../../src';

// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export const memoryDs = new DataSourceConstructor({
  connector: 'memory',
});
