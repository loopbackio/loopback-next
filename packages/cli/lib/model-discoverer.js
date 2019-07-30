const debug = require('./debug')('model-discoverer');
const fs = require('fs');
const path = require('path');

/**
 * Given a datasource and discovery options,
 * return a list of objects {table: 'foo', schema: 'bar}
 */
async function discoverModelNames(ds, options) {
  if (!ds.connected) {
    await new Promise(resolve => {
      ds.on('connected', resolve);
    });
  }
  return ds.discoverModelDefinitions(options);
}

/**
 * Returns the schema definition for a model
 * @param ds - {Juggler.DataSource}
 * @param modelName - {string}
 * @param options - {object}
 * @returns {Promise<Juggler.SchemaDefinition>}
 */
async function discoverSingleModel(ds, modelName, options) {
  const schema = await ds.discoverSchema(modelName, options);
  if (schema) {
    schema.settings = schema && schema.options;
  }
  return schema;
}

/**
 * Loads a DataSource from a file
 * If the path provided is a JSON, it instantiates a juggler.DataSource with the config as the only argument
 * Else it requires it like a compiled loopback datasource
 * @param modulePath
 * @returns juggler.DataSource
 */
function loadDataSource(modulePath) {
  const ds = require(modulePath);
  const key = Object.keys(ds)[0];
  const val = new ds[key]();
  return val;
}

/**
 * Loads a compiled loopback datasource by name
 * @param name - {string}
 * @returns {*}
 */
function loadDataSourceByName(name) {
  debug(`Searching for specified dataSource ${name}`);
  const dataSourceFiles = getAllDataSourceFiles();
  debug(`Loaded ${dataSourceFiles.length} dataSource files`);

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < dataSourceFiles.length; i++) {
    const f = dataSourceFiles[i];
    const ds = loadDataSource(path.resolve(DEFAULT_DATASOURCE_DIRECTORY, f));
    if (ds.name === name) {
      debug(`Found dataSource ${name}`);
      return ds;
    } else {
      debug(`Did not match dataSource ${name} !== ${ds.name}`);
    }
  }
  throw new Error(
    `Cannot find datasource "${name}" in ${DEFAULT_DATASOURCE_DIRECTORY}`,
  );
}

const DEFAULT_DATASOURCE_DIRECTORY = './dist/datasources';

const MODEL_TEMPLATE_PATH = path.resolve(
  __dirname,
  '../generators/model/templates/model.ts.ejs',
);

const sanitizeProperty = function(o) {
  Object.entries(o).forEach(([k, v]) => {
    // Delete the null properties so the template doesn't spit out `key: ;`
    if (v === null) {
      delete o[k];
    }

    // If you are an object or array, stringify so you don't appear as [object [object]
    if (v === Object(v)) {
      o[k] = JSON.stringify(o[k]);
    }
  });

  o.tsType = o.type;
};

function getAllDataSourceFiles(dir = DEFAULT_DATASOURCE_DIRECTORY) {
  return fs.readdirSync(dir).filter(s => s.endsWith('.datasource.js'));
}

module.exports = {
  getAllDataSourceFiles,
  sanitizeProperty,
  discoverModelNames,
  discoverSingleModel,
  loadDataSource,
  loadDataSourceByName,
  DEFAULT_DATASOURCE_DIRECTORY,
  MODEL_TEMPLATE_PATH,
};
