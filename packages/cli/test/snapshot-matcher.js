// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
A lightweight helper for snapshot-based testing.
- Feature inspired by https://jestjs.io/docs/en/snapshot-testing
- Implementation inspired by node-tap

This is an initial experimental version. In the (near) future, we should
move this file to a standalone package so that all Mocha users can use it.
*/

const chalk = require('chalk');
const assert = require('assert');
const path = require('path');
const debug = require('debug')('loopback:cli:test:snapshot-matcher');

const root = process.cwd();
const shouldUpdateSnapshots = process.env.UPDATE_SNAPSHOTS;

// Register root hooks for mocha
const mochaHooks = {
  // This global hook is called once, before the test suite starts.
  // When running tests in parallel, it is invoked once for each test file.
  beforeAll: resetGlobalState,

  // This global hook is called per test
  beforeEach: injectCurrentTest,

  // This global hook is called once, after mocha is finished
  // When running tests in parallel, it is invoked once for each test file.
  afterAll: updateSnapshotFiles,
};

module.exports = {
  initializeSnapshots,
  mochaHooks,
};

// A lookup table for snapshot-matcher instance data (state)
// key: snapshot directory (snapshotDir)
// value: matcher state {snapshotDir, snapshots, snapshotErrors}
const snapshotMatchers = new Map();

// The currently running test (an instance of `Mocha.Test`)
let currentTest;

/** @this {Mocha.Context} */
function injectCurrentTest() {
  currentTest = this.currentTest;
  debug(
    '[%d] Injecting current test %s',
    process.pid,
    getFullTestName(currentTest),
  );
  currentTest.__snapshotCounter = 1;
}

async function updateSnapshotFiles() {
  if (!shouldUpdateSnapshots) return;
  debug('[%d] Updating snapshots (writing to files)', process.pid);
  for (const state of snapshotMatchers.values()) {
    const tasks = Object.entries(state.snapshots).map(([f, data]) => {
      const snapshotFile = buildSnapshotFilePath(state.snapshotDir, f);
      return writeSnapshotData(snapshotFile, data);
    });
    await Promise.all(tasks);
  }
}

function resetGlobalState() {
  debug(
    '[%d] Resetting snapshot matchers',
    process.pid,
    Array.from(snapshotMatchers.keys()),
  );
  currentTest = undefined;
  for (const matcher of snapshotMatchers.values()) {
    resetMatcherState(matcher);
  }
}

function resetMatcherState(matcher) {
  matcher.snapshotErrors = false;
  matcher.snapshots = Object.create(null);
  return matcher;
}

function getOrCreateMatcherForDir(snapshotDir) {
  let matcher = snapshotMatchers.get(snapshotDir);
  if (matcher == null) {
    matcher = resetMatcherState({snapshotDir});
    snapshotMatchers.set(snapshotDir, matcher);
  }
  return matcher;
}

/**
 * Create a function to match the given value against a pre-recorder snapshot.
 *
 * Example usage:
 *
 * ```js
 * // At the top of your test file, initialize the matcher function.
 * // You can also move this code to a shared file require()d from tests.
 * const expectToMatchSnapshot = initializeSnapshots(
 *   path.resolve(__dirname, '../../__snapshots__'),
 * );
 *
 * // Inside your tests, call `expectToMatchSnapshot(actualValue)`
 * describe('my feature', () => {
 *   it('works for strings', function() {
 *     expectToMatchSnapshot('foo\nbar');
 *   });
 * });
 * ```
 */
function initializeSnapshots(snapshotDir) {
  if (debug.enabled) {
    const stack = new Error().stack
      .split(/\n/g)
      // Remove the error message and the top stack frame pointing to ourselves
      // and pick three frames (max), that should be enough to identify
      // which test file called us.
      .slice(2, 5)
      .map(f => `\n${f}`)
      .join();
    debug(
      '[%d] Initializing snapshot matcher, storing snapshots in %s%s',
      process.pid,
      snapshotDir,
      stack,
    );
  }

  const matcher = getOrCreateMatcherForDir(snapshotDir);

  if (!shouldUpdateSnapshots) {
    process.on('exit', function printSnapshotHelp() {
      if (!matcher.snapshotErrors) return;
      console.log(
        chalk.red(`
Some of the snapshot-based tests have failed. Please carefully inspect
the differences to prevent possible regressions. If the changes are
intentional, run the tests again with \`UPDATE_SNAPSHOTS=1\` environment
variable to update snapshots.
        `),
      );
    });
    return function expectToMatchSnapshot(actual) {
      try {
        matchSnapshot(matcher, actual);
      } catch (err) {
        matcher.snapshotErrors = true;
        throw err;
      }
    };
  }

  return function expectToRecordSnapshot(actual) {
    recordSnapshot(matcher, actual);
  };
}

function matchSnapshot(matcher, actualValue) {
  assert(
    typeof actualValue === 'string',
    'Snapshot matcher supports string values only, but was called with ' +
      typeof actualValue,
  );

  const snapshotFile = buildSnapshotFilePath(
    matcher.snapshotDir,
    currentTest.file,
  );
  const snapshotData = loadSnapshotData(snapshotFile);
  const key = buildSnapshotKey(currentTest);

  if (!(key in snapshotData)) {
    const shortFile = path.relative(root, snapshotFile);
    throw new Error(
      `No snapshot found in ${JSON.stringify(shortFile)} ` +
        `for ${JSON.stringify(key)}.\n` +
        'Run the tests with `UPDATE_SNAPSHOTS=1` environment variable ' +
        'to create and update snapshot files.',
    );
  }

  // When running on Windows, `actualValue` may be using `\r\n` as EOL.
  // We are normalizing snapshot data to use `\n` as EOL, but depending on
  // git settings, the content can be converted during git checkout to
  // use `\r\n` instead.
  // For maximum safety, we normalize line endings in both actual and expected
  // values.
  assert.deepStrictEqual(
    normalizeNewlines(actualValue),
    normalizeNewlines(snapshotData[key]),
  );
}

function recordSnapshot(matcher, actualValue) {
  assert(
    typeof actualValue === 'string',
    'Snapshot matcher supports string values only, but was called with ' +
      typeof actualValue,
  );

  const key = buildSnapshotKey(currentTest);
  const testFile = currentTest.file;
  if (debug.enabled) {
    debug(
      'Recording snapshot %j for test file %j',
      key,
      path.relative(root, testFile),
    );
  }

  if (!matcher.snapshots[testFile]) {
    matcher.snapshots[testFile] = Object.create(null);
  }
  matcher.snapshots[testFile][key] = actualValue;
}

function buildSnapshotKey(test) {
  const counter = test.__snapshotCounter || 1;
  test.__snapshotCounter = counter + 1;
  return `${getFullTestName(test)} ${counter}`;
}

function getFullTestName(test) {
  let result = test.title;
  for (;;) {
    if (!test.parent) break;
    test = test.parent;
    if (test.title) {
      result = test.title + ' ' + result;
    }
  }
  return result;
}

function buildSnapshotFilePath(snapshotDir, currentTestFile) {
  const parsed = path.parse(currentTestFile);
  const parts = path.normalize(parsed.dir).split(path.sep);

  const ix = parts.findIndex(p => p === 'test' || p === '__tests__');
  if (ix < 0) {
    throw new Error(
      'Snapshot checker requires test files in `test` or `__tests__`',
    );
  }

  // Remove everything from start up to (including) `test` or `__tests__`
  parts.splice(0, ix + 1);

  return path.join(snapshotDir, ...parts, parsed.name + '.snapshots.js');
}

function loadSnapshotData(snapshotFile) {
  try {
    const data = require(snapshotFile);
    for (const key in data) {
      const entry = data[key];
      if (entry.length > 2 && entry.startsWith('\n') && entry.endsWith('\n')) {
        data[key] = entry.slice(1, -1);
      }
    }
    return data;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Snapshot file ${snapshotFile} was not found.\n` +
          'Run the tests with `UPDATE_SNAPSHOTS=1` environment variable ' +
          'to create and update snapshot files.',
      );
    }
    throw err;
  }
}

function writeSnapshotData(snapshotFile, snapshots) {
  const writeFileAtomic = require('write-file-atomic');
  const naturalCompare = require('natural-compare');
  const mkdirp = require('mkdirp');

  const header = `// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';
`;

  const entries = Object.keys(snapshots)
    .sort(naturalCompare)
    .map(key => buildSnapshotCode(key, snapshots[key]));

  const content = header + entries.join('\n');
  mkdirp.sync(path.dirname(snapshotFile));
  debug('Updating snapshot file %j', path.relative(root, snapshotFile));
  return writeFileAtomic(snapshotFile, content, {encoding: 'utf-8'});
}

function buildSnapshotCode(key, value) {
  return `
exports[\`${escape(key)}\`] = \`
${escape(normalizeNewlines(value))}
\`;
`;
}

function escape(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function normalizeNewlines(value) {
  return value.replace(/\r\n|\r/g, '\n');
}
