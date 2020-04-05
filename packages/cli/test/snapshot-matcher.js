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
const debug = require('debug')('loopback:cli:test');

// Cached states in the process for snapshots
// key: snapshot director
// value: state
const states = new Map();

const mochaHooks = {
  // Register root hooks for mocha
  beforeEach: function injectCurrentTest() {
    const currentTest = this.currentTest;
    debug(
      '[%d] Injecting current test %s',
      process.pid,
      getFullTestName(currentTest),
    );
    // This global hook is called per test
    for (const state of states.values()) {
      state.currentTest = currentTest;
      state.currentTest.__snapshotCounter = 1;
    }
  },

  // This global hook is called after mocha is finished
  afterAll: async function updateSnapshots() {
    for (const state of states.values()) {
      const tasks = Object.entries(state.snapshots).map(([f, data]) => {
        const snapshotFile = buildSnapshotFilePath(state.snapshotDir, f);
        return writeSnapshotData(snapshotFile, data);
      });
      await Promise.all(tasks);
    }
  },

  beforeAll: () => {
    debug(
      '[%d] Resetting states for snapshots',
      process.pid,
      Array.from(states.keys()),
    );
    for (const state of states.values()) {
      resetState(state);
    }
  },
};

module.exports = {
  initializeSnapshots,
  mochaHooks,
};

function resetState(state) {
  state.currentTest = undefined;
  state.snapshotErrors = false;
  state.snapshots = Object.create(null);
  return state;
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
  debug('[%d] Initializing snapshots for %s', process.pid, snapshotDir);
  let state = states.get(snapshotDir);
  if (state == null) {
    state = resetState({snapshotDir});
    states.set(snapshotDir, state);
  }

  if (!process.env.UPDATE_SNAPSHOTS) {
    process.on('exit', function printSnapshotHelp() {
      if (!state.snapshotErrors) return;
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
        matchSnapshot(state, actual);
      } catch (err) {
        state.snapshotErrors = true;
        throw err;
      }
    };
  }

  return function expectToRecordSnapshot(actual) {
    recordSnapshot(state, actual);
  };
}

function matchSnapshot(state, actualValue) {
  assert(
    typeof actualValue === 'string',
    'Snapshot matcher supports string values only, but was called with ' +
      typeof actualValue,
  );

  const snapshotFile = buildSnapshotFilePath(
    state.snapshotDir,
    state.currentTest.file,
  );
  const snapshotData = loadSnapshotData(snapshotFile);
  const key = buildSnapshotKey(state.currentTest);

  if (!(key in snapshotData)) {
    throw new Error(
      `No snapshot found for ${JSON.stringify(key)}.\n` +
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

function recordSnapshot(state, actualValue) {
  assert(
    typeof actualValue === 'string',
    'Snapshot matcher supports string values only, but was called with ' +
      typeof actualValue,
  );

  const key = buildSnapshotKey(state.currentTest);
  const testFile = state.currentTest.file;
  if (!state.snapshots[testFile]) {
    state.snapshots[testFile] = Object.create(null);
  }
  state.snapshots[testFile][key] = actualValue;
}

function buildSnapshotKey(currentTest) {
  const counter = currentTest.__snapshotCounter || 1;
  currentTest.__snapshotCounter = counter + 1;
  return `${getFullTestName(currentTest)} ${counter}`;
}

function getFullTestName(currentTest) {
  let result = currentTest.title;
  for (;;) {
    if (!currentTest.parent) break;
    currentTest = currentTest.parent;
    if (currentTest.title) {
      result = currentTest.title + ' ' + result;
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
