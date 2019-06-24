#!/usr/bin/env node
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Update generated api md files with Jekyll macros and create index page
 */
const updateApiDocs = require('..').updateApiDocs;
const silent = process.argv.includes('--silent');
const dryRun = process.argv.includes('--dry-run');

async function main() {
  await updateApiDocs({silent, dryRun});
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
