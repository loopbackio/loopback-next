// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const util = require('util');

const mochaHooks = {
  beforeAll: startRecording,
  beforeEach: saveCurrentTest,
  afterEach: checkTestFailure,
  afterAll: stopRecordingAndReportProblems,
};

module.exports = {
  mochaHooks,
};

const INTERCEPTED_METHODS = ['log', 'error', 'warn'];
const originalConsole = {};
for (const m of INTERCEPTED_METHODS) {
  originalConsole[m] = console[m];
}

let problems = [];
let warnings = [];
let currentTest;
let someTestsFailed = false;

function startRecording() {
  problems = [];
  warnings = [];

  for (const m of INTERCEPTED_METHODS) {
    console[m] = recordForbiddenCall(m);
  }

  process.on('warning', warning => {
    warnings.push(warning);
  });
}

function recordForbiddenCall(methodName) {
  return function recordForbiddenConsoleUsage(...args) {
    // Print the original message
    originalConsole[methodName](...args);

    // Find out who called us.
    // The first line is the error message,
    // the second line points to this very function.
    const stack = new Error().stack.split(/\n/).slice(2);

    // Mocha reporters are allowed to call console functions
    if (/[\/\\]node_modules[\/\\]mocha[\/\\]/.test(stack[0])) {
      return;
    }

    // Record the problem otherwise
    const msg = util.format(...args);
    problems.push({msg, stack});
  };
}

/** @this {Mocha.Context} */
function saveCurrentTest() {
  currentTest = this.currentTest;
}

function checkTestFailure() {
  if (currentTest.state === 'failed') someTestsFailed = true;
}

function stopRecordingAndReportProblems() {
  // First of all, restore original console methods
  for (const m of INTERCEPTED_METHODS) {
    console[m] = originalConsole[m];
  }

  // Don't complain about console logs when some of the tests have failed.
  // It's a common practice to add temporary console logs while troubleshooting.
  // NOTE: When running tests in parallel, console logs from non-failing tests
  // executed in a different worker process are going to be still reported.
  if (someTestsFailed) return;

  if (!warnings.length) {
    for (const w of warnings) {
      originalConsole.warn(w);
    }
  }
  if (!problems.length) return;
  const log = originalConsole.log;

  log(
    '\n=== ATTENTION - INVALID USAGE OF CONSOLE LOGS DETECTED ===',
    '\nLearn more at',
    'https://github.com/loopbackio/loopback-next/blob/master/packages/build/README.md#a-note-on-console-logs-printed-by-tests\n',
  );

  for (const p of problems) {
    // print the first line of the console log
    log(p.msg.split(/\n/)[0]);
    // print the stack trace
    log(p.stack.join('\n'));
    // add an empty line as a delimiter
    log('\n');
  }

  throw new Error(
    'Invalid usage of console logs detected. See the text above for more details.',
  );
}
