// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {readFileSync} from 'fs';
import * as path from 'path';
import {format} from 'util';
import {main} from '../..';

describe('context examples', () => {
  const logs: string[] = [];
  const errors: string[] = [];

  let originalConsoleLog = console.log;
  let originalConsoleError = console.error;

  before(disableConsoleOutput);

  it('runs all examples', async function() {
    // For some reason, travis CI on mac reports timeout for some builds
    // Error: Timeout of 2000ms exceeded.
    // eslint-disable-next-line no-invalid-this
    this.timeout(5000);
    const expectedLogs = loadExpectedLogs();
    await main();
    expect(errors).to.eql([]);
    expect(replaceDates(logs)).to.eql(replaceDates(expectedLogs));
  });

  after(restoreConsoleOutput);

  /**
   * Load the expected logs from `fixtures/examples-output.txt`.
   *
   * Run `node . > fixtures/examples-output.txt` to update the logs if needed.
   */
  function loadExpectedLogs() {
    const output = readFileSync(
      path.join(__dirname, '../../../fixtures/examples-output.txt'),
      'utf-8',
    );
    const items = output.split('\n');
    // When we run `node . > fixtures/examples-output.txt`, a new line is added
    // at the end of the file.
    items.pop();
    return items;
  }

  function disableConsoleOutput() {
    originalConsoleLog = console.log;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log = (fmt: any, ...params: any[]) => {
      logs.push(format(fmt, ...params));
    };
    originalConsoleError = console.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (fmt: any, ...params: any[]) => {
      errors.push(format(fmt, ...params));
    };
  }

  function restoreConsoleOutput() {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }

  function replaceDates(items: string[]) {
    return items.map(str => str.replace(/\[\d+[\w\d\-\.\:]+\]/g, '[DATE]'));
  }
});
