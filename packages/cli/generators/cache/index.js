'use strict';

const BaseGenerator = require('../../lib/base-generator');
const chalk = require('chalk');
const debug = require('../../lib/debug')('cache-generator');
const utils = require('../../lib/utils');
const updateIndex = require('../../lib/update-index');
const MODEL = 'models';
const REPOSITORY = 'repositories';
const PROVIDER = 'providers';

const cacheModel = 'cache.model.ts';
const cacheRepository = 'cache.repository.ts';
const cacheProvider = 'cache-strategy.provider.ts';

const {updateApplicationTs} = require('./cache-component');

const g = require('../../lib/globalize');

module.exports = class CacheGenerator extends BaseGenerator {
  constructor(args, opts) {
    super(args, opts);
  }

  _setupGenerator() {
    this.option('datasource', {
      type: String,
      required: false,
      description: g.f('A valid redis datasource'),
    });

    return super._setupGenerator();
  }

  checkLoopBackProject() {
    return super.checkLoopBackProject();
  }

  async promptDataSourceName() {
    if (this.shouldExit()) return false;
    debug('Prompting for a datasource');

    // grab the datasource from the command line
    const dsClass = this.options.datasource
      ? utils.toClassName(this.options.datasource) + 'DataSource'
      : '';

    debug(`command line datasource is ${dsClass}`);

    const dataSourcesDir = this.destinationPath(
      `${utils.sourceRootDir}/${utils.datasourcesDir}`,
    );

    const dataSourceClasses = await utils.getArtifactList(
      dataSourcesDir,
      'datasource',
      true,
    );

    // List all data sources
    const dataSourceList = dataSourceClasses.map(ds => ({
      className: ds,
    }));
    debug('datasourceList from %s', dataSourcesDir, dataSourceList);

    // Find redis data sources
    const redisDataSources = dataSourceList.filter(ds => {
      debug(`data source inspecting item: ${ds.className}`);
      const dsObj = utils.getDataSourceConfig(dataSourcesDir, ds.className);

      if (
        dsObj.connector === 'kv-redis' ||
        dsObj.connector === 'loopback-connector-kv-redis'
      ) {
        ds.usePositionalParams = dsObj.positional;
        ds.name = dsObj.name;
        ds.className = utils.toClassName(dsObj.name) + 'DataSource';
        ds.specPath = dsObj.spec;
        return true;
      }
    });

    debug('Data sources using redis connector', redisDataSources);

    if (redisDataSources.length === 0) {
      return;
    }

    const matchedDs = redisDataSources.find(ds => ds.className === dsClass);
    if (matchedDs) {
      this.dataSourceInfo = {
        name: matchedDs.name,
        className: matchedDs.className,
      };
      this.log(
        g.f('Datasource %s - %s found for Redis'),
        this.options.datasource,
        this.dataSourceInfo.className,
      );
      return;
    }

    if (dsClass) return;

    const answers = await this.prompt([
      {
        type: 'list',
        name: 'dataSource',
        message: g.f('Please select the datasource'),
        choices: redisDataSources.map(ds => ({
          name: `${ds.name} - ${ds.className}`,
          value: ds,
        })),
        default: `${redisDataSources[0].name} - ${redisDataSources[0].className}`,
        validate: utils.validateClassName,
      },
    ]);

    debug('Datasource selected', answers);
    if (answers && answers.dataSource) {
      this.dataSourceInfo = {
        name: answers.dataSource.name,
        className: answers.dataSource.className,
      };
      this.log(
        g.f('Datasource %s - %s selected'),
        this.dataSourceInfo.name,
        this.dataSourceInfo.className,
      );
    }
  }

  /** Generates cache.model.ts */
  _generateModel() {
    const source = this.templatePath('src/models/cache-model-template.ts.ejs');
    const dest = this.destinationPath(`src/models/${cacheModel}`);
    if (debug.enabled) {
      debug('Copying artifact to: %s', dest);
    }
    this.copyTemplatedFiles(source, dest, {});
  }

  /** Generates cache.repository.ts */
  _generateRepository() {
    const source = this.templatePath(
      'src/repositories/cache-repository-template.ts.ejs',
    );
    const dest = this.destinationPath(`src/repositories/${cacheRepository}`);
    if (debug.enabled) {
      debug('Copying artifact to: %s', dest);
    }
    this.copyTemplatedFiles(source, dest, this.dataSourceInfo);
  }

  /** Generates cache-strategy.provider.ts */
  _generateProvider() {
    const source = this.templatePath(
      'src/providers/cache-strategy-provider-template.ts.ejs',
    );
    const dest = this.destinationPath(`src/providers/${cacheProvider}`);
    if (debug.enabled) {
      debug('Copying artifact to: %s', dest);
    }
    this.copyTemplatedFiles(source, dest, {});
  }

  async _updateIndex(file, dir) {
    if (file != null && dir != null) {
      const targetDir = this.destinationPath(`src/${dir}`);
      // Check file being generated to ensure they succeeded
      const status = this.conflicter.generationStatus[file];
      if (status !== 'skip' && status !== 'identical') {
        await updateIndex(targetDir, file, this.fs);
      }
    }
  }

  async scaffold() {
    if (this.shouldExit()) return false;
    this._generateModel();
    await this._updateIndex(cacheModel, MODEL);
    this._generateRepository();
    await this._updateIndex(cacheRepository, REPOSITORY);
    this._generateProvider();
    await this._updateIndex(cacheProvider, PROVIDER);

    await updateApplicationTs(this.destinationPath());

    this.log(
      chalk.blue(
        g.f(
          `
          Please update your sequence to add following lines
          constructor(
            ...
            @inject(CacheBindings.CACHE_CHECK_ACTION) protected checkCache: CacheCheckFn,
            @inject(CacheBindings.CACHE_SET_ACTION) protected setCache: CacheSetFn,
            ...
          ) {}

          async handle(context: RequestContext) {
            ...
            const cache = await this.checkCache(request);
            if (cache) {
              this.send(response, cache.data);
              return;
            }
            ...
          }
          `,
        ),
      ),
    );
  }

  install() {
    if (this.shouldExit()) return false;
    debug('install npm dependencies');
    const pkgJson = this.packageJson || {};
    const deps = pkgJson.dependencies || {};
    const pkgs = [];
    const pkgVersionRange = deps['loopback-api-cache'];
    if (!pkgVersionRange) {
      // No dependency found for loopback-api-cache
      pkgs.push('loopback-api-cache');
    }

    if (pkgs.length === 0) return;

    this.pkgManagerInstall(pkgs, {
      npm: {
        save: true,
      },
    });
  }

  async end() {
    await super.end();
    if (this.shouldExit()) return;
  }
};
