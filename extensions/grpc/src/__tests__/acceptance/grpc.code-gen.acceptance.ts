// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, TestSandbox} from '@loopback/testlab';
import fs from 'fs';
import path from 'path';
import {generateTsCode} from '../..';

describe('GrpcCodeGen', () => {
  let sandbox: TestSandbox;
  before(() => {
    sandbox = new TestSandbox(path.join(__dirname, '../../../.sandbox'));
  });

  it('generates TS code', async () => {
    const protoFile = path.join(
      __dirname,
      '../../../src/__tests__/fixtures/protos/greeter.proto',
    );

    const target = path.join(sandbox.path, 'greeter.proto.js');
    await generateTsCode(target, protoFile);

    expect(
      fs.existsSync(path.join(sandbox.path, 'greeter.proto.js')),
    ).to.be.true();
    expect(
      fs.existsSync(path.join(sandbox.path, 'greeter.proto.d.ts')),
    ).to.be.true();
  });

  after(() => sandbox.delete());
});
