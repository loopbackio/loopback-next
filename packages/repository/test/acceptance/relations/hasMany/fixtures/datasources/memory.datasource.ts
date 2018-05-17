// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* tslint:disable:no-unused-variable */
// juggler import is required to infer DataSourceConstructor type
import {DataSourceConstructor, juggler} from '../../../../../../src';

export const memoryDs = new DataSourceConstructor({
  connector: 'memory',
});
