// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const {TestSandbox} = require('@loopback/testlab');
const {expectFileToMatchSnapshot} = require('../../snapshots');

const generator = path.join(__dirname, '../../../generators/relation');
const {SANDBOX_FILES} = require('../../fixtures/relation');
const testUtils = require('../../test-utils');

// Test Sandbox
const MODEL_APP_PATH = 'src/models';
const CONTROLLER_PATH = 'src/controllers';
const REPOSITORY_APP_PATH = 'src/repositories';

const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));

const sourceFileName = 'doctor.model.ts';
const throughFileName = 'appointment.model.ts';
const controllerFileName = 'doctor-patient.controller.ts';
const repositoryFileName = 'doctor.repository.ts';

describe('lb4 relation HasManyThrough', /** @this {Mocha.Suite} */ function () {
  this.timeout(30000);

  context('generates model relation with default values', () => {
    const promptArray = [
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
      },
    ];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('has correct imports and relation name patients', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );
        const sourceRepoFilePath = path.join(
          sandbox.path,
          REPOSITORY_APP_PATH,
          repositoryFileName,
        );

        assert.file(sourceFilePath);
        assert.file(sourceRepoFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
        expectFileToMatchSnapshot(sourceRepoFilePath);
      });

      it('has correct default foreign keys', async () => {
        const throughFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          throughFileName,
        );

        assert.file(throughFilePath);
        expectFileToMatchSnapshot(throughFilePath);
      });
    }
  });

  context('generates model relation with custom relation name', () => {
    const promptArray = [
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
        relationName: 'myPatients',
      },
    ];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('relation name should be myPatients', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );
        const sourceRepoFilePath = path.join(
          sandbox.path,
          REPOSITORY_APP_PATH,
          repositoryFileName,
        );

        assert.file(sourceFilePath);
        assert.file(sourceRepoFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
        expectFileToMatchSnapshot(sourceRepoFilePath);
      });
    }
  });

  context('generates model relation with custom keyFrom and/or keyTo', () => {
    const promptArray = [
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
        sourceKeyOnThrough: 'customKeyFrom',
      },
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
        targetKeyOnThrough: 'customKeyTo',
      },
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
        sourceKeyOnThrough: 'customKeyFrom',
        targetKeyOnThrough: 'customKeyTo',
      },
    ];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('add custom keyTo and/or keyFrom to the through model', async () => {
        const sourceFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          sourceFileName,
        );

        const throughFilePath = path.join(
          sandbox.path,
          MODEL_APP_PATH,
          throughFileName,
        );
        assert.file(sourceFilePath);
        assert.file(throughFilePath);
        expectFileToMatchSnapshot(sourceFilePath);
        expectFileToMatchSnapshot(throughFilePath);
      });
    }
  });

  context('checks if the controller file created ', () => {
    const promptArray = [
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
      },
      {
        relationType: 'hasManyThrough',
        sourceModel: 'Doctor',
        destinationModel: 'Patient',
        throughModel: 'Appointment',
        relationName: 'myPatients',
      },
    ];

    promptArray.forEach(function (multiItemPrompt, i) {
      describe('answers ' + JSON.stringify(multiItemPrompt), () => {
        suite(multiItemPrompt, i);
      });
    });

    function suite(multiItemPrompt, i) {
      before(async function runGeneratorWithAnswers() {
        await sandbox.reset();
        await testUtils
          .executeGenerator(generator)
          .inDir(sandbox.path, () =>
            testUtils.givenLBProject(sandbox.path, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(multiItemPrompt);
      });

      it('controller file has been created with hasManyThrough relation', async () => {
        const filePath = path.join(
          sandbox.path,
          CONTROLLER_PATH,
          controllerFileName,
        );
        assert.file(filePath);
        expectFileToMatchSnapshot(filePath);
      });
    }
  });
});
