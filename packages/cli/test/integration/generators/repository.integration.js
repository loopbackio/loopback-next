// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/repository');
const SANDBOX_FILES = require('../../fixtures/repository').SANDBOX_FILES;
const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 repository', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(30000);

  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  // special cases regardless of the repository type
  describe('generate repositories on special conditions', () => {
    it('generates multiple crud repositories', async () => {
      const multiItemPrompt = {
        dataSourceClass: 'DbmemDatasource',
        modelNameList: ['MultiWord', 'DefaultModel'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(multiItemPrompt);

      const expectedMultiWordFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'multi-word.repository.ts',
      );
      const expectedDefaultModelFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'default-model.repository.ts',
      );

      assert.file(expectedMultiWordFile);
      assert.file(expectedDefaultModelFile);

      assert.fileContent(
        expectedMultiWordFile,
        /export class MultiWordRepository extends DefaultCrudRepository</,
      );
      assert.fileContent(
        expectedMultiWordFile,
        /typeof MultiWord.prototype.pk/,
      );

      assert.fileContent(
        expectedDefaultModelFile,
        /export class DefaultModelRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedDefaultModelFile,
        /typeof DefaultModel.prototype.id/,
      );

      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/multi-word.repository';/,
      );
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/default-model.repository';/,
      );
    });

    it('generates a multi-word crud repository', async () => {
      const multiItemPrompt = {
        dataSourceClass: 'DbmemDatasource',
        modelNameList: ['MultiWord'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(multiItemPrompt);

      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'multi-word.repository.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MultiWordRepository extends DefaultCrudRepository</,
      );
      assert.fileContent(expectedFile, /typeof MultiWord.prototype.pk/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/multi-word.repository';/,
      );
    });

    it('generates a custom name repository', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('myrepo --datasource dbmem --model MultiWord');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'myrepo.repository.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class MyrepoRepository extends DefaultCrudRepository</,
      );
      assert.fileContent(expectedFile, /typeof MultiWord.prototype.pk/);
      assert.file(INDEX_FILE);
      assert.fileContent(INDEX_FILE, /export \* from '.\/myrepo.repository';/);
    });

    it('generates a crud repository from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--config myconfig.json');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decorator-defined.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DecoratorDefinedRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof DecoratorDefined.prototype.thePK/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decorator-defined.repository';/,
      );
    });

    it('generates a repository asking for the ID name', async () => {
      const multiItemPrompt = {
        dataSourceClass: 'DbmemDatasource',
        modelNameList: ['InvalidId'],
        propertyName: 'myid',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(multiItemPrompt);

      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'invalid-id.repository.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class InvalidIdRepository extends DefaultCrudRepository</,
      );
      assert.fileContent(expectedFile, /typeof InvalidId.prototype.myid/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/invalid-id.repository';/,
      );
    });
  });

  describe('all invalid parameters and usage', () => {
    it('does not run with an invalid model name', async () => {
      const basicPrompt = {
        dataSourceClass: 'DbmemDatasource',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(basicPrompt)
          .withArguments(' --model InvalidModel'),
      ).to.be.rejectedWith(/No models found/);
    });

    it("does not run when user doesn't select a model", async () => {
      const basicPrompt = {
        dataSourceClass: 'DbmemDatasource',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () =>
            testUtils.givenLBProject(SANDBOX_PATH, {
              additionalFiles: SANDBOX_FILES,
            }),
          )
          .withPrompts(basicPrompt),
      ).to.be.rejectedWith(/You did not select a valid model/);
    });

    it('does not run with empty datasource list', async () => {
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(SANDBOX_PATH, () => testUtils.givenLBProject(SANDBOX_PATH)),
      ).to.be.rejectedWith(/No datasources found/);
    });
  });

  describe('valid generation of crud repositories', () => {
    it('generates a crud repository from default model', async () => {
      const basicPrompt = {
        dataSourceClass: 'DbmemDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(basicPrompt)
        .withArguments(' --model DefaultModel');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'default-model.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DefaultModelRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(expectedFile, /typeof DefaultModel.prototype.id/);
      assert.fileContent(expectedFile, /DefaultModelRelations/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/default-model.repository';/,
      );
    });

    it('generates a crud repository from numbered model file name', async () => {
      const basicPrompt = {
        dataSourceClass: 'DbmemDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(basicPrompt)
        .withArguments(' --model Model1NameWithNum1');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'model-1-name-with-num1.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class Model1NameWithNum1Repository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof Model1NameWithNum1.prototype.id/,
      );
      assert.fileContent(expectedFile, /Model1NameWithNum1Relations/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/model-1-name-with-num1.repository';/,
      );
    });

    it('allows other connectors', async () => {
      const files = SANDBOX_FILES.filter(
        e =>
          e.path !== 'src/datasources' ||
          e.file.includes('sqlite3.datasource.'),
      );
      const basicPrompt = {
        dataSourceClass: 'Sqlite3Datasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            // Only use the sqlite3 datasource
            additionalFiles: files,
          }),
        )
        .withPrompts(basicPrompt)
        .withArguments(' --model DefaultModel');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'default-model.repository.ts',
      );
      assert.file(expectedFile);
    });

    it('generates a crud repository from hyphened model file name', async () => {
      const basicPrompt = {
        dataSourceClass: 'MyDsDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(basicPrompt)
        .withArguments(' --model DefaultModel');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'default-model.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import {MyDsDataSource} from '..\/datasources';/,
      );
      assert.fileContent(
        expectedFile,
        /\@inject\('datasources.MyDS'\) dataSource: MyDsDataSource,/,
      );
      assert.fileContent(
        expectedFile,
        /export class DefaultModelRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(expectedFile, /typeof DefaultModel.prototype.id/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/default-model.repository';/,
      );
    });

    it('generates a crud repository from decorator defined model', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments('--datasource dbmem --model DecoratorDefined');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decorator-defined.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DecoratorDefinedRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof DecoratorDefined.prototype.thePK/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decorator-defined.repository';/,
      );
    });
    it('generates a crud repository from custom base class', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments(
          '--datasource dbmem --model DecoratorDefined --repositoryBaseClass DefaultModelRepository',
        );
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decorator-defined.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /import {DefaultModelRepository} from '.\/default-model.repository.base';/,
      );
      assert.fileContent(
        expectedFile,
        /export class DecoratorDefinedRepository extends DefaultModelRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof DecoratorDefined.prototype.thePK/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decorator-defined.repository';/,
      );
    });
  });

  describe('valid generation of kv repositories', () => {
    it('generates a kv repository from default model', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withArguments(
          '--datasource dbkv --model DefaultModel --repositoryBaseClass DefaultKeyValueRepository',
        );
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'default-model.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /DefaultModelRepository extends DefaultKeyValueRepository</,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/default-model.repository';/,
      );
    });

    it('generates a kv repository from decorator defined model', async () => {
      const basicPrompt = {
        dataSourceClass: 'DbkvDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(SANDBOX_PATH, () =>
          testUtils.givenLBProject(SANDBOX_PATH, {
            additionalFiles: SANDBOX_FILES,
          }),
        )
        .withPrompts(basicPrompt)
        .withArguments(
          '--model DecoratorDefined --repositoryBaseClass DefaultKeyValueRepository',
        );
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decorator-defined.repository.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /DecoratorDefinedRepository extends DefaultKeyValueRepository</,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decorator-defined.repository';/,
      );
    });
  });
});

// Sandbox constants
const REPOSITORY_APP_PATH = 'src/repositories';
const INDEX_FILE = path.join(SANDBOX_PATH, REPOSITORY_APP_PATH, 'index.ts');
