// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as path from 'path';
// The juggler reference must exist for consuming code to correctly infer
// type info used in the "db" export (contained in juggler.DataSource).
// tslint:disable-next-line:no-unused-variable
import {juggler} from '@loopback/repository';

const dsConfigPath = path.resolve(
  __dirname,
  '../../../config/datasources.json',
);
const config = require(dsConfigPath);

// TODO(bajtos) Ideally, datasources should be created by @loopback/boot
// and registered with the app for dependency injection.
// However, we need to investigate how to access these datasources from
// integration tests where we don't have access to the full app object.
// For example, @loopback/boot can provide a helper function for
// performing a partial boot that creates datasources only.
export const db = new juggler.DataSource(config);
