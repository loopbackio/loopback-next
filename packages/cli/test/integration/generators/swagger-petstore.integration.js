// // Copyright IBM Corp. 2018,2020. All Rights Reserved.
// // Node module: @loopback/cli
// // This file is licensed under the MIT License.
// // License text available at https://opensource.org/licenses/MIT

// 'use strict';

// const path = require('path');
// const assert = require('yeoman-assert');
// const generator = path.join(__dirname, '../../../generators/openapi');
// const specPath = path.join(
//   __dirname,
//   '../../fixtures/openapi/2.0/petstore-expanded-swagger.json',
// );
// const {expectFileToMatchSnapshot} = require('../../snapshots');

// const testlab = require('@loopback/testlab');
// const TestSandbox = testlab.TestSandbox;

// // Test Sandbox
// const sandbox = new TestSandbox(path.resolve(__dirname, '../.sandbox'));
// const testUtils = require('../../test-utils');

// const props = {
//   url: specPath,
// };

// describe('openapi-generator specific files', () => {
//   const index = path.resolve(sandbox.path, 'src/controllers/index.ts');
//   const controller = path.resolve(
//     sandbox.path,
//     'src/controllers/open-api.controller.ts',
//   );

//   const petModel = path.resolve(sandbox.path, 'src/models/pet.model.ts');
//   const newPetModel = path.resolve(sandbox.path, 'src/models/new-pet.model.ts');
//   const errorModel = path.resolve(sandbox.path, 'src/models/error.model.ts');

//   after('reset sandbox', async () => {
//     await sandbox.reset();
//   });

//   it('generates all the proper files', async () => {
//     await testUtils
//       .executeGenerator(generator)
//       .inDir(sandbox.path, () => testUtils.givenLBProject(sandbox.path))
//       .withPrompts(props);
//     assert.file(controller);

//     expectFileToMatchSnapshot(controller);
//     expectFileToMatchSnapshot(index);
//     expectFileToMatchSnapshot(petModel);
//     expectFileToMatchSnapshot(newPetModel);
//     expectFileToMatchSnapshot(errorModel);
//   });
// });
