// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler} from '@loopback/repository';
import * as debugFactory from 'debug';
import * as fs from 'fs';
import * as path from 'path';
import {withCrudCtx} from './helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from './types.repository-tests';

const debug = debugFactory('loopback:repository-tests');

type SuiteFn = (
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) => void;

export function crudRepositoryTestSuite(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  partialFeatures: Partial<CrudFeatures>,
) {
  const features: CrudFeatures = {
    idType: 'string',
    freeFormProperties: true,
    inclusionResolvers: true,
    ...partialFeatures,
  };

  describe('CRUD Repository operations', () => {
    before(
      withCrudCtx(function setupContext(ctx: CrudTestContext) {
        ctx.dataSourceOptions = dataSourceOptions;
        ctx.repositoryClass = repositoryClass;
        ctx.features = features;
      }),
    );
    before(
      withCrudCtx(function setupGlobalDataSource(ctx: CrudTestContext) {
        ctx.dataSource = new juggler.DataSource(ctx.dataSourceOptions);
      }),
    );

    const testRoot = path.resolve(__dirname, 'crud');
    let testFiles = fs.readdirSync(testRoot);
    testFiles = testFiles.filter(function(it) {
      return (
        !!require.extensions[path.extname(it).toLowerCase()] &&
        /\.suite\.[^.]+$/.test(it)
      );
    });

    for (const ix in testFiles) {
      const name = testFiles[ix];
      const fullPath = path.resolve(testRoot, name);
      debug('Loading CRUD test suite %j', fullPath);
      const allExports = require(fullPath);
      for (const key in allExports) {
        const suite: SuiteFn = allExports[key];
        if (typeof suite !== 'function') continue;
        debug(
          'Calling suite function %j with args',
          suite.name,
          dataSourceOptions,
          'class ' + repositoryClass.name,
          features,
        );
        suite(dataSourceOptions, repositoryClass, features);
      }
    }
  });
}
