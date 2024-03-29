#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script that will verify that all packages in our monorepo
 * are registered in all required places and have the expected metadata in their
 * package.json.
 */
'use strict';

const path = require('node:path');
const fse = require('fs-extra');
const pkgJson = require('@npmcli/package-json');
const mapWorkspaces = require('@npmcli/map-workspaces');
const {runMain} = require('./script-util');

function isTypeScriptPackage(location) {
  return fse.existsSync(path.join(location, 'tsconfig.json'));
}

/**
 * Check existence of LICENSE file in the monorepo packages
 * @param {Array} packages A list of @lerna/project packages
 */
async function checkLicenseFiles(packages) {
  const errors = [];

  for (const p of packages) {
    const exists = await fse.pathExists(path.join(p.location, 'LICENSE'));

    if (!exists) {
      errors.push(`${p.name} directory doesn't contain LICENSE file`);
    }
  }

  return errors;
}

/**
 * Check mention of packages in MONOREPO.md file
 * @param {Array} packages A list of @lerna/project packages
 * @param {string} rootPath A project.rootPath
 */
async function checkMonorepoFile(packages, rootPath) {
  const errors = [];
  const monorepoFile = await fse.readFile('docs/site/MONOREPO.md', 'utf8');

  for (const p of packages) {
    const packagePath = path.relative(rootPath, p.location).replace(/\\/g, '/');

    const packageExists =
      monorepoFile.includes(p.name) || monorepoFile.includes(packagePath);

    if (!packageExists) {
      errors.push(`${p.name} is not added in the MONOREPO.md file`);
    }
  }

  return errors;
}

/**
 * Check mention of packages in CODEOWNERS.md file
 * @param {Array} packages A list of @lerna/project packages
 * @param {string} rootPath A project.rootPath
 */
async function checkCodeOwnersFile(packages, rootPath) {
  const errors = [];
  const excludes = ['@loopback/sandbox-example'];

  const codeOwnersFile = await fse.readFile('CODEOWNERS', 'utf8');

  for (const p of packages) {
    if (excludes.includes(p.name)) {
      continue;
    }

    const packagePath = path.relative(rootPath, p.location).replace(/\\/g, '/');

    if (!codeOwnersFile.includes(packagePath)) {
      errors.push(`${p.name} is not added in the CODEOWNERS.md file`);
    }
  }

  return errors;
}

/**
 * Check all required fields of package.json for each package on the matching with root package.json
 * @param {Array} packages A list of @lerna/project packages
 * @param {Object} rootPkg A root package.json
 */
async function checkPkgsPackageJson(packages, rootPkg) {
  const errors = [];
  const pkgs = packages.filter(p => !p.private);

  function getCopyrightOwner(pkg) {
    return pkg['copyright.owner'] || (pkg.copyright && pkg.copyright.owner);
  }

  function getErrorText(packageName, field) {
    return `${packageName} package.json doesn't contain ${field} field or has incorrect value`;
  }

  for (const p of pkgs) {
    const pkg = p.content;

    const isCorrectMain = pkg.main && pkg.main === 'dist/index.js';

    if (isTypeScriptPackage(p.location) && !isCorrectMain) {
      errors.push(getErrorText(p.name, 'main'));
    }

    const isCorrectTypes = pkg.types && pkg.types === 'dist/index.d.ts';

    if (isTypeScriptPackage(p.location) && !isCorrectTypes) {
      errors.push(getErrorText(p.name, 'types'));
    }

    const isPublicAccess =
      pkg.publishConfig &&
      pkg.publishConfig.access &&
      pkg.publishConfig.access === 'public';

    if (!isPublicAccess) {
      errors.push(getErrorText(p.name, 'publishConfig.access'));
    }

    if (pkg.author !== rootPkg.author) {
      errors.push(getErrorText(p.name, 'author'));
    }

    if (getCopyrightOwner(pkg) !== getCopyrightOwner(rootPkg)) {
      errors.push(getErrorText(p.name, 'copyright.owner'));
    }

    if (pkg.license !== rootPkg.license) {
      errors.push(getErrorText(p.name, 'license'));
    }

    const isCorrectRepositoryUrl =
      pkg.repository &&
      pkg.repository.url &&
      pkg.repository.url.includes(
        'https://github.com/loopbackio/loopback-next.git',
      );

    if (!isCorrectRepositoryUrl) {
      errors.push(getErrorText(p.name, 'repository.url'));
    }

    const isCorrectRepositoryDirectory =
      pkg.repository && pkg.repository.directory;
    const isRepositoryDirectoryExist = fse.existsSync(p.location);

    if (!isCorrectRepositoryDirectory) {
      errors.push(getErrorText(p.name, 'repository.directory'));
    }

    if (!isRepositoryDirectoryExist) {
      errors.push(`${p.name} directory doesn't exist in the monorepo`);
    }

    checkDepsOrder(p, pkg, errors);
  }

  return errors;
}

/**
 * Format and return explanation text about problem packages
 * @param {string[]} errors A list of problem packages with corresponding error text
 */
function formatErrorsText(errors) {
  const errorPackages = errors.map(error => `- ${error}`).join('\n');

  return [
    'Some of the packages are not following loopback-next guidelines:',
    '',
    errorPackages,
    '',
    'Please fix the problems listed above and run the following command to verify:',
    'npm run check-package-metadata',
  ].join('\n');
}

async function checkPackagesMetadata() {
  const rootPath = process.cwd();
  const {content: pkg} = await pkgJson.load(rootPath);
  const workspaces = await mapWorkspaces({cwd: rootPath, pkg});
  const packages = await Promise.all(
    Array.from(workspaces, async ([name, location]) => {
      const {content} = await pkgJson.load(location);
      return {
        name,
        location,
        private: content.private ?? false,
        content,
      };
    }),
  );
  const rootPkg = fse.readJsonSync('package.json');

  const errors = (
    await Promise.all([
      checkLicenseFiles(packages),
      checkMonorepoFile(packages, rootPath),
      checkCodeOwnersFile(packages, rootPath),
      checkPkgsPackageJson(packages, rootPkg),
    ])
  ).flat();

  if (errors.length) {
    throw new Error(formatErrorsText(errors));
  }
}

function checkDepsOrder(pkg, json, errors) {
  const actualOrder = Object.keys(json).filter(k =>
    ['dependencies', 'devDependencies', 'peerDependencies'].includes(k),
  );

  const expectedOrder = [
    'peerDependencies',
    'dependencies',
    'devDependencies',
  ].filter(k => actualOrder.includes(k));

  const actualStr = actualOrder.join(' ');
  const expectedStr = expectedOrder.join(' ');

  if (actualStr !== expectedStr) {
    const pkgPath = path.relative(pkg.rootPath, pkg.location);
    errors.push(
      `${pkgPath}/package.json has incorrect order of keys.\n` +
        `  Actual:   ${actualStr}\n` +
        `  Expected: ${expectedStr}`,
    );
  }
}

module.exports = checkPackagesMetadata;

runMain(module, checkPackagesMetadata);
