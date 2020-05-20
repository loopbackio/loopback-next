#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * This is an internal script for LoopBack maintainers to check out a forked
 * repo/branch for a given pull request
 *
 * Sometimes a LoopBack maintainer needs to help improve/fix a pull request.
 * This script allows us to set up the PR code base as follows:
 *
 * 1. Read the url and branch for base and head for the PR
 * 2. Set up remote stream <pr-#> to <pr-repo>
 * 3. Fetch changes from <pr-repo>/<pr-branch>
 * 4. Fetch changes from origin/<base-branch>
 * 5. Check out <pr-branch> to track <pr-repo>/<pr-branch>
 * 6. Rebase the PR branch to the origin/<base-branch>
 */
const build = require('../packages/build');
const path = require('path');
const rootDir = path.join(__dirname, '..');

async function main() {
  const prUrlOrNum = process.argv[2];
  if (!prUrlOrNum) {
    console.error(
      'Usage: node %s <PR-number-or-url>',
      path.relative(process.cwd(), process.argv[1]),
    );
    process.exit(1);
  }

  const parts = prUrlOrNum.split('/').filter(Boolean);
  const prNum = parts[parts.length - 1] || parts[0];

  console.log(`Checking out pull request #${prNum}...`);

  const url = `https://api.github.com/repos/strongloop/loopback-next/pulls/${prNum}`;

  const result = await getPRInfo(url);
  const headUrl = result.head.repo.ssh_url;
  const headBranch = result.head.ref;
  const baseBranch = result.base.ref;

  const prStream = `pr-${prNum}`;
  await git('remote', 'add', prStream, headUrl);
  await git('fetch', prStream, headBranch);
  await git('fetch', 'origin', baseBranch);
  await git('checkout', '--track', `${prStream}/${headBranch}`);
  await git('rebase', `origin/${baseBranch}`);

  console.log(`PR ${prNum} is now checked out.`);
}

const https = require('https');
const url = require('url');

/**
 * Fetch PR information
 * @param {string} prUrl - PR url
 */
function getPRInfo(prUrl) {
  const options = {
    ...url.parse(prUrl),
    headers: {
      'User-Agent': 'Node.js https client',
    },
  };
  return new Promise((resolve, reject) => {
    https
      .get(options, res => {
        const {statusCode} = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error(
            'Invalid content-type.\n' +
              `Expected application/json but received ${contentType}`,
          );
        }
        if (error) {
          console.error(error.message);
          // Consume response data to free up memory
          res.resume();
          return reject(error);
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', chunk => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', e => {
        reject(e);
      });
  });
}

/**
 * Run `git` command with the arguments
 * @param  {...string[]} args - Git args
 */
async function git(...args) {
  console.log('> git', ...args);
  const shell = build.runShell('git', args, {
    cwd: rootDir,
  });
  await waitForProcessExit(shell);
}

/**
 * Return a promise to be resolved by the child process exit event
 * @param {ChildProcess} child - Child process
 */
function waitForProcessExit(child) {
  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      if (code === 0 || code === 128) resolve(code);
      else {
        reject(
          new Error(
            `Process ${child.pid} exits with code ${code} signal ${signal}`,
          ),
        );
      }
    });
  });
}

console.log('+-----------------------------------------------+');
console.log('| Check out GitHub CLI - https://cli.github.com |');
console.log('+-----------------------------------------------+');
console.log();

main().catch(err => {
  console.error(err);
  process.exit(1);
});
