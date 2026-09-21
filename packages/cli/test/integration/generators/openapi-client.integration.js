// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const {TestSandbox} = require('@loopback/testlab');
const {assertFilesToMatchSnapshot} = require('../../snapshots');
const {SANDBOX_FILES} = require('../../fixtures/openapi/3.0');
const testUtils = require('../../test-utils');

const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const generator = path.join(__dirname, '../../../generators/openapi');
const assert = require('assert');
const fs = require('fs');

const props = {
  url: path.resolve(
    __dirname,
    '../../fixtures/openapi/3.0/petstore-expanded.yaml',
  ),
  dataSourceName: 'petStore',
};

describe('openapi-generator with --client', /** @this {Mocha.Suite} */ function () {
  // These tests take longer to execute, they used to time out on Travis CI
  this.timeout(10000);

  before('reset sandbox', () => sandbox.reset());
  afterEach('reset sandbox', () => sandbox.reset());

  it('generates all files for both server and client', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true});

    assertControllers();
    assertDataSources();
    assertServices();
    assertModels();
  });

  it('allows baseModel option', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true, baseModel: 'Model'});

    assertControllers();
    assertDataSources();
    assertServices();
    assertModels();
  });

  it('does not generates files for client with --no-client', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: false});

    const options = {exists: false};
    assertControllers();
    assertDataSources(options);
    assertServices(options);
    assertModels();
  });

  it('does not generates files for server with --no-server', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({server: false, client: true});

    assertControllers({exists: false});
    assertDataSources();
    assertServices();
    assertModels();
  });
});

it('generates files with --client for an existing datasource', /** @this {Mocha.Context} */ async function () {
  // These tests take longer to execute, they used to time out on Travis CI
  this.timeout(10000);
  await testUtils
    .executeGenerator(generator)
    .inDir(sandbox.path, () =>
      testUtils.givenLBProject(sandbox.path, {
        additionalFiles: SANDBOX_FILES,
      }),
    )
    .withPrompts({
      dataSource: {
        name: 'petStore',
        className: 'PetStoreDataSource',
        usePositionalParams: false,
        specPath: 'petstore-expanded.yaml',
      },
    })
    .withOptions({server: false, client: true});

  assertControllers({exists: false});
  assertServices();
  assertModels();
});

it('generates files with --client and --datasource for an existing datasource', async () => {
  await testUtils
    .executeGenerator(generator)
    .inDir(sandbox.path, () =>
      testUtils.givenLBProject(sandbox.path, {additionalFiles: SANDBOX_FILES}),
    )
    .withOptions({server: false, client: true, datasource: 'petStore'});

  assertControllers({exists: false});
  assertServices();
  assertModels();
});

describe('OpenAPI Generator - outDir support and artifact generation', /** @this {Mocha.Suite} */ function () {
  this.timeout(10000);
  before('reset sandbox', () => sandbox.reset());
  afterEach('reset sandbox', () => sandbox.reset());

  const applicationTsContent = `import {BootMixin} from '@loopback/boot';
    import {ApplicationConfig} from '@loopback/core';
    export class MyApplication extends BootMixin(Application) {
      constructor(options: ApplicationConfig = {}) {
        super(options);
        this.bootOptions = {
          controllers: {
            dirs: ['controllers'],
            extensions: ['.controller.js'],
            nested: true,
          },
        };
      }
    }`;

  it('should generate all artifacts into custom outDir', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true, server: true, outDir: 'src/generated'});

    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/controllers')),
      'Controllers folder should exist in src/generated',
    );
    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/datasources')),
      'Datasources folder should exist in src/generated',
    );
    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/services')),
      'Services folder should exist in src/generated',
    );
    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/models')),
      'Models folder should exist in src/generated',
    );
  });

  it('should read outDir from config option and generate artifacts in custom outDir', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({
        client: true,
        config: JSON.stringify({
          outDir: 'src/generated',
        }),
      });

    // artifacts should be in custom outDir from config
    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/models')),
      'Models folder should exist in src/generated when outDir set via config',
    );
    assert.ok(
      fs.existsSync(path.join(sandbox.path, 'src/generated/services')),
      'Services folder should exist in src/generated when outDir set via config',
    );
  });

  it('should prefix controller filenames when prefix option is set', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true, server: true, prefix: 'pet'});

    // controller files should start with prefix
    const controllers = fs.readdirSync(
      path.join(sandbox.path, 'src/controllers'),
    );
    assert.ok(
      controllers.some(f => f.startsWith('pet.')),
      "Controller files should start with 'pet.' prefix",
    );
  });

  it('should not prefix controller filenames when prefix is not set', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({client: true, server: true});

    // controller files should NOT have prefix pattern
    const controllers = fs.readdirSync(
      path.join(sandbox.path, 'src/controllers'),
    );
    assert.ok(
      controllers.every(f => !f.match(/^\w+\.\w+\.controller\.ts$/)),
      'Controller files should not have prefix pattern when no prefix is set',
    );
  });
  it('should update application.ts bootOptions with custom outDir paths', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => {
        testUtils.givenLBProject(sandbox.path);
        // Create src folder and application.ts manually
        const srcDir = path.join(sandbox.path, 'src');
        fs.mkdirSync(srcDir, {recursive: true});
        fs.writeFileSync(
          path.join(srcDir, 'application.ts'),
          applicationTsContent,
        );
      })
      .withPrompts(props)
      .withOptions({client: true, outDir: 'src/generated'});

    const applicationTs = fs.readFileSync(
      path.join(sandbox.path, 'src/application.ts'),
      'utf-8',
    );

    // should contain custom paths
    assert.ok(
      applicationTs.includes("'generated/controllers'"),
      "bootOptions should contain 'generated/controllers'",
    );
    assert.ok(
      applicationTs.includes("'generated/datasources'"),
      "bootOptions should contain 'generated/datasources'",
    );
    assert.ok(
      applicationTs.includes("'generated/models'"),
      "bootOptions should contain 'generated/models'",
    );
    assert.ok(
      applicationTs.includes("'generated/services'"),
      "bootOptions should contain 'generated/services'",
    );
  });

  it('should skip bootOptions update when application.ts does not exist', async () => {
    await assert.doesNotReject(
      testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
        .withPrompts(props)
        .withOptions({client: true, outDir: 'src/generated'}),
      'Should not throw when application.ts is missing',
    );
  });

  it('should skip bootOptions update when outDir is default src', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => {
        testUtils.givenLBProject(sandbox.path);
        const srcDir = path.join(sandbox.path, 'src');
        fs.mkdirSync(srcDir, {recursive: true});
        fs.writeFileSync(
          path.join(srcDir, 'application.ts'),
          applicationTsContent,
        );
      })
      .withPrompts(props)
      .withOptions({client: true, outDir: 'src'});

    const applicationTs = fs.readFileSync(
      path.join(sandbox.path, 'src/application.ts'),
      'utf-8',
    );

    // should NOT contain custom paths
    assert.ok(
      !applicationTs.includes("'src/controllers'"),
      "bootOptions should NOT contain 'src/controllers'",
    );
  });

  it('should ignore prefix when custom outDir is set', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props)
      .withOptions({
        client: true,
        server: true,
        outDir: 'src/generated',
        prefix: 'pet',
      });

    // controller files should NOT be prefixed when outDir is custom
    const controllers = fs.readdirSync(
      path.join(sandbox.path, 'src/generated/controllers'),
    );
    assert.ok(
      controllers.every(f => !f.startsWith('pet.')),
      'Controller files should NOT have prefix when custom outDir is set',
    );
  });

  it('should select correct template and set export fields for -with-relations models', () => {
    const OpenApiGenerator = require('../../../generators/openapi');

    const cases = [
      {
        label: 'with prefix',
        modelSpecs: [
          {kind: 'class', fileName: 'aladv-user-with-relations.model.ts'},
        ],
        options: {prefix: 'aladv', outDir: 'src'},
        expected: {
          template: 'model-template-with-re-exports-only.ts.ejs',
          exportModelName: 'User',
          exportModelFileName: 'aladv-user.model',
          prefix: 'Aladv',
        },
      },
      {
        label: 'without prefix',
        modelSpecs: [{kind: 'class', fileName: 'user-with-relations.model.ts'}],
        options: {outDir: 'src'},
        expected: {
          template: 'model-template-with-re-exports-only.ts.ejs',
          exportModelName: 'User',
          exportModelFileName: 'user.model',
          prefix: undefined,
        },
      },
    ];

    for (const {label, modelSpecs, options, expected} of cases) {
      const copiedFiles = [];
      const gen = Object.create(OpenApiGenerator.prototype);
      gen.options = options;
      gen.modelSpecs = modelSpecs;
      gen.templatePath = p => p;
      gen.destinationPath = p => p;
      gen.copyTemplatedFiles = (source, dest, context) =>
        copiedFiles.push({source, context});

      gen._generateModels();

      const {source, context} = copiedFiles[0];
      assert.ok(
        source.includes(expected.template),
        `[${label}] wrong template selected`,
      );
      assert.strictEqual(
        context.exportModelName,
        expected.exportModelName,
        `[${label}] exportModelName`,
      );
      assert.strictEqual(
        context.exportModelFileName,
        expected.exportModelFileName,
        `[${label}] exportModelFileName`,
      );
      assert.strictEqual(context.prefix, expected.prefix, `[${label}] prefix`);
    }
  });

  it('should use plain model or type template for non-with-relations models', () => {
    const OpenApiGenerator = require('../../../generators/openapi');

    const cases = [
      {
        label: 'class model',
        modelSpecs: [{kind: 'class', fileName: 'user.model.ts'}],
        expectedTemplate: 'model-template.ts.ejs',
      },
      {
        label: 'type model',
        modelSpecs: [{kind: 'type', fileName: 'user.model.ts'}],
        expectedTemplate: 'type-template.ts.ejs',
      },
    ];

    for (const {label, modelSpecs, expectedTemplate} of cases) {
      const copiedFiles = [];
      const gen = Object.create(OpenApiGenerator.prototype);
      gen.options = {outDir: 'src'};
      gen.modelSpecs = modelSpecs;
      gen.templatePath = p => p;
      gen.destinationPath = p => p;
      gen.copyTemplatedFiles = (source, dest, context) =>
        copiedFiles.push({source, context});

      gen._generateModels();

      assert.ok(
        copiedFiles[0].source.includes(expectedTemplate),
        `[${label}] should use ${expectedTemplate}`,
      );
    }
  });

  it('should not crash when prefix does not match the model filename', () => {
    const OpenApiGenerator = require('../../../generators/openapi');

    const copiedFiles = [];
    const gen = Object.create(OpenApiGenerator.prototype);
    gen.options = {prefix: 'xyz', outDir: 'src'};
    gen.modelSpecs = [
      {kind: 'class', fileName: 'user-with-relations.model.ts'},
    ];
    gen.templatePath = p => p;
    gen.destinationPath = p => p;
    gen.copyTemplatedFiles = (source, dest, context) =>
      copiedFiles.push({source, context});

    // Should not throw
    assert.doesNotThrow(() => gen._generateModels());

    const {context} = copiedFiles[0];
    // exportModelName should still be defined and a non-empty string
    assert.ok(
      typeof context.exportModelName === 'string' &&
        context.exportModelName.length > 0,
      'exportModelName should still be set even when prefix does not match filename',
    );
  });
});

function assertModels(options) {
  assertFiles(
    options,
    'src/models/index.ts',
    'src/models/pet.model.ts',
    'src/models/new-pet.model.ts',
    'src/models/error.model.ts',
  );
}

function assertControllers(options) {
  assertFiles(
    options,
    'src/controllers/index.ts',
    'src/controllers/open-api.controller.ts',
  );
}

function assertDataSources(options) {
  assertFiles(
    options,
    'src/datasources/index.ts',
    'src/datasources/pet-store.datasource.ts',
  );
}

function assertServices(options) {
  assertFiles(
    options,
    'src/services/index.ts',
    'src/services/open-api.service.ts',
  );
}

function assertFiles(options, ...files) {
  options = {rootPath: sandbox.path, ...options};
  assertFilesToMatchSnapshot(options, ...files);
}
