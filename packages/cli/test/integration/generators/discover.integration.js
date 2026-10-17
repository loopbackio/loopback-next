// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// Imports
const path = require('path');
const assert = require('yeoman-assert');
const {expect, TestSandbox} = require('@loopback/testlab');
const {expectFileToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/discover');
require('../lib/artifact-generator')(generator);
require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');
const basicModelFileChecks = require('../lib/file-check').basicModelFileChecks;

// In this test suite we invoke the full generator with mocked prompts
// and inspect the generated model file(s).
// Such tests are slow to run, we strive to keep only few of them.
// Use unit tests to verify the conversion from discovered model schema
// to LB4 model template data, see
// tests/unit/discovery/import-discovered-model.test.ts

// Test Sandbox
const SANDBOX_FILES = require('../../fixtures/discover').SANDBOX_FILES;
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

// CLI Inputs
const baseOptions = {
  all: true,
  dataSource: 'mem',
};
const outDirOptions = {
  ...baseOptions,
  outDir: 'src',
};
const schemaViewsOptions = {
  ...baseOptions,
  schema: 'aSchema',
  views: false,
};
const disableCamelCaseOptions = {
  ...baseOptions,
  schema: 'Naming',
  disableCamelCase: true,
};
const missingDataSourceOptions = {
  dataSource: 'foo',
};
const optionalIdOptions = {
  ...baseOptions,
  optionalId: true,
};
const treatTINYINT1AsTinyIntOptions = {
  ...baseOptions,
  treatTINYINT1AsTinyInt: false,
};

const relationsSetTrue = {
  ...baseOptions,
  relations: true,
};
const specificModelsOptions = {
  models: 'Test',
  dataSource: 'mem',
  views: false,
  disableCamelCase: true,
};

const baseOptionsWithSmallS = {
  all: true,
  datasource: 'mem',
};

// Expected File Name
const defaultExpectedTestModel = path.join(
  sandbox.path,
  'src/models/test.model.ts',
);
const defaultExpectedSchemaModel = path.join(
  sandbox.path,
  'src/models/schema.model.ts',
);
const defaultExpectedViewModel = path.join(
  sandbox.path,
  'src/models/view.model.ts',
);
const defaultExpectedNamingModel = path.join(
  sandbox.path,
  'src/models/naming.model.ts',
);
const appointmentModel = path.join(
  sandbox.path,
  'src/models/appointment.model.ts',
);
const doctorModel = path.join(sandbox.path, 'src/models/doctor.model.ts');
const doctorRepository = path.join(
  sandbox.path,
  'src/repositories/doctor.repository.ts',
);
const appointmentRepository = path.join(
  sandbox.path,
  'src/repositories/appointment.repository.ts',
);
const patientRepository = path.join(
  sandbox.path,
  'src/repositories/patient.repository.ts',
);

const doctorDoctorController = path.join(
  sandbox.path,
  'src/controllers/doctor-doctor.controller.ts',
);
const appointmentDoctorController = path.join(
  sandbox.path,
  'src/controllers/appointment-doctor.controller.ts',
);
const appointmentPatientController = path.join(
  sandbox.path,
  'src/controllers/appointment-patient.controller.ts',
);

const defaultExpectedIndexFile = path.join(sandbox.path, 'src/models/index.ts');
const movedExpectedTestModel = path.join(sandbox.path, 'src/test.model.ts');
const movedExpectedIndexFile = path.join(sandbox.path, 'src/index.ts');

// Base Tests
/*describe('discover-generator extending BaseGenerator', baseTests);
describe('generator-loopback4:discover', tests);*/

describe('lb4 discover integration', () => {
  describe('model discovery', () => {
    beforeEach('reset sandbox', async () => {
      await sandbox.reset();
      await sandbox.mkdir('dist/datasources');
      await sandbox.mkdir('src/datasources');
    });

    it('generates all models without prompts using --all --dataSource', /** @this {Mocha.Context} */ async function () {
      this.timeout(10000);
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(baseOptions);

      basicModelFileChecks(defaultExpectedTestModel, defaultExpectedIndexFile);
      expectFileToMatchSnapshot(defaultExpectedSchemaModel);
      expectFileToMatchSnapshot(defaultExpectedViewModel);
    });

    it('uses a different --outDir if provided', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(outDirOptions);

      basicModelFileChecks(movedExpectedTestModel, movedExpectedIndexFile);
      expectFileToMatchSnapshot(movedExpectedTestModel);
    });

    it('excludes models based on the --views and --schema options', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(schemaViewsOptions);

      assert.noFile(defaultExpectedViewModel);
      assert.noFile(defaultExpectedTestModel);
      assert.file(defaultExpectedSchemaModel);
    });

    it('keeps model property names the same as the db column names', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(disableCamelCaseOptions);

      assert.file(defaultExpectedNamingModel);
      expectFileToMatchSnapshot(defaultExpectedNamingModel);
    });

    it('will fail gracefully if you specify a --dataSource which does not exist', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withOptions(missingDataSourceOptions),
      ).to.be.rejectedWith(/Cannot find datasource/);
    });

    it('does not mark id property as required based on optionalId option', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(optionalIdOptions);

      assert.file(defaultExpectedTestModel);
      expectFileToMatchSnapshot(defaultExpectedTestModel);
    });

    it('treatTINYINT1AsTinyInt set to false to treat tinyint(1) as boolean', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(treatTINYINT1AsTinyIntOptions);

      assert.file(defaultExpectedTestModel);
      expectFileToMatchSnapshot(defaultExpectedTestModel);
    });
    it('generate relations with --relations', /** @this {Mocha.Context} */ async function () {
      this.timeout(20000);
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(relationsSetTrue);
      assert.file(appointmentRepository);
      assert.file(patientRepository);
      assert.file(doctorRepository);
      assert.file(appointmentDoctorController);
      assert.file(appointmentPatientController);
      assert.file(doctorDoctorController);
      expectFileToMatchSnapshot(appointmentDoctorController);
      expectFileToMatchSnapshot(appointmentPatientController);
      expectFileToMatchSnapshot(doctorDoctorController);
      assert.file(appointmentModel);
      expectFileToMatchSnapshot(appointmentModel);
    });
    it('discovers models with --relations', /** @this {Mocha.Context} */ async function () {
      this.timeout(20000);
      await testUtils
        .executeGenerator(generator)
        .inDir(sandbox.path, () =>
          testUtils.givenLBProject(sandbox.path, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withOptions(relationsSetTrue);
      assert.file(appointmentRepository);
      assert.file(patientRepository);
      assert.file(doctorRepository);
      assert.file(appointmentDoctorController);
      assert.file(appointmentPatientController);
      assert.file(doctorDoctorController);
      expectFileToMatchSnapshot(appointmentDoctorController);
      expectFileToMatchSnapshot(appointmentPatientController);
      expectFileToMatchSnapshot(doctorDoctorController);
      assert.file(doctorModel);
      expectFileToMatchSnapshot(doctorModel);
    });
  });
  it('generates specific models without prompts using --models', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions(specificModelsOptions);

    basicModelFileChecks(defaultExpectedTestModel, defaultExpectedIndexFile);
    assert.file(defaultExpectedTestModel);
  });

  it('generates all models without prompts using --all --datasource', /** @this {Mocha.Context} */ async function () {
    this.timeout(10000);
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () =>
        testUtils.givenLBProject(sandbox.path, {
          additionalFiles: SANDBOX_FILES,
        }),
      )
      .withOptions(baseOptionsWithSmallS);

    basicModelFileChecks(defaultExpectedTestModel, defaultExpectedIndexFile);
    expectFileToMatchSnapshot(defaultExpectedSchemaModel);
    expectFileToMatchSnapshot(defaultExpectedViewModel);
  });
});
