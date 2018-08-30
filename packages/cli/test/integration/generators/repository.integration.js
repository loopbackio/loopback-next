// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const testlab = require('@loopback/testlab');
const fs = require('fs');

const expect = testlab.expect;
const TestSandbox = testlab.TestSandbox;

const generator = path.join(__dirname, '../../../generators/repository');

const testUtils = require('../../test-utils');

// Test Sandbox
const SANDBOX_PATH = path.resolve(__dirname, '..', '.sandbox');
const sandbox = new TestSandbox(SANDBOX_PATH);

describe('lb4 repository', () => {
  beforeEach('reset sandbox', async () => {
    await sandbox.reset();
  });

  // special cases regardless of the repository type
  describe('generate repositories on special conditions', () => {
    it('generates a multi-word crud repository', async () => {
      const multiItemPrompt = {
        dataSourceClassName: 'DbmemDatasource',
        modelNameList: ['MultiWord'],
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
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

    it('generates a crud repository from a config file', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
        )
        .withArguments('--config myconfig.json');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decoratordefined.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DecoratordefinedRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof Decoratordefined.prototype.thePK/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decoratordefined.repository';/,
      );
    });

    it('generates a repository asking for the ID name', async () => {
      const multiItemPrompt = {
        dataSourceClassName: 'DbmemDatasource',
        modelNameList: ['InvalidId'],
        propertyName: 'myid',
      };

      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
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
        dataSourceClassName: 'DbmemDatasource',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(
            SANDBOX_PATH,
            async () => await prepareGeneratorForRepository(SANDBOX_PATH),
          )
          .withPrompts(basicPrompt)
          .withArguments(' --model InvalidModel'),
      ).to.be.rejectedWith(/No models found/);
    });

    it("does not run when user doesn't select a model", async () => {
      const basicPrompt = {
        dataSourceClassName: 'DbmemDatasource',
      };
      return expect(
        testUtils
          .executeGenerator(generator)
          .inDir(
            SANDBOX_PATH,
            async () => await prepareGeneratorForRepository(SANDBOX_PATH),
          )
          .withPrompts(basicPrompt),
      ).to.be.rejectedWith(/You did not select a valid model/);
    });

    it('does not run with empty datasource list', async () => {
      return expect(
        testUtils.executeGenerator(generator).inDir(
          SANDBOX_PATH,
          async () =>
            await prepareGeneratorForRepository(SANDBOX_PATH, {
              noFixtures: true,
            }),
        ),
      ).to.be.rejectedWith(/No datasources found/);
    });
  });

  describe('valid generation of crud repositories', () => {
    it('generates a crud repository from default model', async () => {
      const basicPrompt = {
        dataSourceClassName: 'DbmemDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
        )
        .withPrompts(basicPrompt)
        .withArguments(' --model Defaultmodel');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'defaultmodel.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DefaultmodelRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(expectedFile, /typeof Defaultmodel.prototype.id/);
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/defaultmodel.repository';/,
      );
    });

    it('generates a crud repository from decorator defined model', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
        )
        .withArguments('dbmem --model decoratordefined');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decoratordefined.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /export class DecoratordefinedRepository extends DefaultCrudRepository\</,
      );
      assert.fileContent(
        expectedFile,
        /typeof Decoratordefined.prototype.thePK/,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decoratordefined.repository';/,
      );
    });
  });

  describe('valid generation of kv repositories', () => {
    it('generates a kv repository from default model', async () => {
      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
        )
        .withArguments('dbkv --model Defaultmodel');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'defaultmodel.repository.ts',
      );
      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /DefaultmodelRepository extends DefaultKeyValueRepository</,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/defaultmodel.repository';/,
      );
    });

    it('generates a kv repository from decorator defined model', async () => {
      const basicPrompt = {
        dataSourceClassName: 'DbkvDatasource',
      };
      await testUtils
        .executeGenerator(generator)
        .inDir(
          SANDBOX_PATH,
          async () => await prepareGeneratorForRepository(SANDBOX_PATH),
        )
        .withPrompts(basicPrompt)
        .withArguments('--model decoratordefined');
      const expectedFile = path.join(
        SANDBOX_PATH,
        REPOSITORY_APP_PATH,
        'decoratordefined.repository.ts',
      );

      assert.file(expectedFile);
      assert.fileContent(
        expectedFile,
        /DecoratordefinedRepository extends DefaultKeyValueRepository</,
      );
      assert.file(INDEX_FILE);
      assert.fileContent(
        INDEX_FILE,
        /export \* from '.\/decoratordefined.repository';/,
      );
    });
  });
});

// Sandbox constants
const DATASOURCE_APP_PATH = 'src/datasources';
const MODEL_APP_PATH = 'src/models';
const CONFIG_PATH = '.';
const REPOSITORY_APP_PATH = 'src/repositories';
const INDEX_FILE = path.join(SANDBOX_PATH, REPOSITORY_APP_PATH, 'index.ts');
const DUMMY_CONTENT = '--DUMMY VALUE--';

const SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myconfig.json',
    content: `{
      "name": "dbmem",
      "model": "decoratordefined"
    }`,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.json',
    content: JSON.stringify({
      name: 'dbkv',
      connector: 'kv-redis',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.json',
    content: JSON.stringify({
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.json',
    content: JSON.stringify({
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: MODEL_APP_PATH,
    file: 'decoratordefined.model.ts',
    content: `
    import {Entity, model} from '@loopback/repository';

    @model({
      name: 'Product',
      properties: {
        thePK: {type: 'number', id: true},
        name: {type: 'string', required: true},
      },
    })
    export class DecoratorDefined extends Entity {
      thePK: number;
      name: string;

      constructor(data?: Partial<DecoratorDefined>) {
        super(data);
      }
    }
    `,
  },
  {
    path: MODEL_APP_PATH,
    file: 'defaultmodel.model.ts',
    content: `
    import {Entity, model, property} from '@loopback/repository';

    @model()
    export class DefaultModel extends Entity {
      @property({
        type: 'number',
        id: true,
        default: 0,
      })
      id?: number;

      @property({
        type: 'string',
      })
      desc?: string;

      @property({
        type: 'number',
        default: 0,
      })
      balance?: number;

      constructor(data?: Partial<DefaultModel>) {
        super(data);
      }
    }
    `,
  },
  {
    path: MODEL_APP_PATH,
    file: 'multi-word.model.ts',
    content: `
    import {Entity, model, property} from '@loopback/repository';

    @model()
    export class MultiWord extends Entity {
      @property({
        type: 'string',
        id: true,
        default: 0,
      })
      pk?: string;

      @property({
        type: 'string',
      })
      desc?: string;

      constructor(data?: Partial<MultiWord>) {
        super(data);
      }
    }
    `,
  },
  {
    path: MODEL_APP_PATH,
    file: 'invalid-id.model.ts',
    content: `
    import {Entity, model, property} from '@loopback/repository';

    @model()
    export class InvalidID extends Entity {
      @property({
        type: 'string',
        required: true,
        default: 0,
      })
      id: string;

      @property({
        type: 'string',
      })
      desc?: string;

      constructor(data?: Partial<InvalidID>) {
        super(data);
      }
    }
    `,
  },
];

async function prepareGeneratorForRepository(rootDir, options) {
  options = options || {};
  const content = {};
  if (!options.excludeKeyword) {
    content.keywords = ['loopback'];
  }

  if (!options.excludePackageJSON) {
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify(content),
    );
  }

  if (!options.excludeYoRcJSON) {
    fs.writeFileSync(path.join(rootDir, '.yo-rc.json'), JSON.stringify({}));
  }

  fs.mkdirSync(path.join(rootDir, 'src'));

  if (!options.excludeControllersDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'controllers'));
  }

  if (!options.excludeModelsDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'models'));
  }

  if (!options.excludeRepositoriesDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'repositories'));
  }

  if (!options.excludeDataSourcesDir) {
    fs.mkdirSync(path.join(rootDir, 'src', 'datasources'));
  }

  if (!options.noFixtures) {
    copyFixtures();
  }
}

function copyFixtures() {
  for (let theFile of SANDBOX_FILES) {
    const fullPath = path.join(SANDBOX_PATH, theFile.path, theFile.file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, theFile.content);
    }
  }
}
