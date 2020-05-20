#!/usr/bin/env node
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Run api-extractor against the monorepo
 */
const {runExtractorForMonorepo, runExtractorForPackage} = require('..');

const silent = process.argv.includes('--silent');
const dryRun = process.argv.includes('--dry-run');

const pkgOnly = process.argv.includes('--package-only');
const ignoreErrors =
  process.argv.includes('--ignore-errors') || process.env.TSDOCS_IGNORE_ERRORS;
/**
 * The option to control if reports are generated by api-extractor
 */
const apiReportEnabled = process.argv.includes('--report');

async function main() {
  if (pkgOnly) {
    runExtractorForPackage({silent, dryRun, ignoreErrors});
    return;
  }
  await runExtractorForMonorepo({
    silent,
    dryRun,
    ignoreErrors,
    apiReportEnabled,
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
