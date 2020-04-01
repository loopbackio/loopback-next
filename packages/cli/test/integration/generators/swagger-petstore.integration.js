// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const assert = require('yeoman-assert');
const generator = path.join(__dirname, '../../../generators/openapi');
const specPath = path.join(
  __dirname,
  '../../fixtures/openapi/2.0/petstore-expanded-swagger.json',
);

const testlab = require('@loopback/testlab');
const TestSandbox = testlab.TestSandbox;

// Test Sandbox
const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
const testUtils = require('../../test-utils');

const props = {
  url: specPath,
};

describe('openapi-generator specific files', () => {
  const index = path.resolve(sandbox.path, 'src/controllers/index.ts');
  const controller = path.resolve(
    sandbox.path,
    'src/controllers/open-api.controller.ts',
  );

  const petModel = path.resolve(sandbox.path, 'src/models/pet.model.ts');
  const newPetModel = path.resolve(sandbox.path, 'src/models/new-pet.model.ts');
  const errorModel = path.resolve(sandbox.path, 'src/models/error.model.ts');

  after('reset sandbox', async () => {
    await sandbox.reset();
  });

  it('generates all the proper files', async () => {
    await testUtils
      .executeGenerator(generator)
      .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
      .withPrompts(props);
    assert.file(controller);

    assert.fileContent(controller, 'export class OpenApiController {');
    assert.fileContent(controller, `@operation('get', '/pets')`);
    assert.fileContent(
      controller,
      `async findPets(@param({name: 'tags', in: 'query'}) tags: string[], ` +
        `@param({name: 'limit', in: 'query'}) limit: number): Promise<Pet[]>`,
    );

    assert.fileContent(index, `export * from './open-api.controller';`);

    assert.file(petModel);
    assert.fileContent(petModel, `import {NewPet} from './new-pet.model';`);
    assert.fileContent(
      petModel,
      `export type Pet = NewPet & {
  id: number;
};`,
    );
    assert.file(newPetModel);
    assert.fileContent(newPetModel, `export class NewPet {`);
    assert.fileContent(newPetModel, `constructor(data?: Partial<NewPet>) {`);
    assert.fileContent(newPetModel, `@model({name: 'NewPet'})`);
    assert.fileContent(newPetModel, `@property({required: true})`);
    assert.fileContent(newPetModel, `name: string;`);
    assert.fileContent(newPetModel, `@property()`);
    assert.fileContent(newPetModel, `tag?: string`);
    assert.file(errorModel);
  });
});
