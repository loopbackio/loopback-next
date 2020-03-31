// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`lb4 rest-crud legacy JSON-based configuration loads config from \`{name}.datasource.config.json\` 1`] = `
import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {DefaultModel} from '../models';

const config: ModelCrudRestApiConfig = {
  model: DefaultModel,
  pattern: 'CrudRest',
  dataSource: 'dbmem',
  basePath: '/default-models',
};
module.exports = config;

`;
