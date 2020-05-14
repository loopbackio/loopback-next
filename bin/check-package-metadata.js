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

const path = require('path');
const fs = require('fs-extra');

const Project = require('@lerna/project');

const MIT_LICENSE_TEXT = `
MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
`;

async function checkLicenseFiles(packages) {
  for await (const p of packages) {
    const content = await fs.readFile(path.join(p.location, 'LICENSE'), 'utf8');

    if (!content.includes(MIT_LICENSE_TEXT)) {
      throw new Error(
        `${p.name} LICENSE file doesn't contain MIT license text`,
      );
    }

    if (!content.includes(`Node module: ${p.name}`)) {
      throw new Error(`${p.name} LICENSE file doesn't contain package name`);
    }
  }
}

async function checkMonorepoFile(packages, rootPath) {
  const monorepoFile = await fs.readFile('docs/site/MONOREPO.md', 'utf8');

  for (const p of packages) {
    const packagePath = path.relative(rootPath, p.location);

    const isPackageExist =
      monorepoFile.includes(p.name) || monorepoFile.includes(packagePath);

    if (!isPackageExist) {
      throw new Error(
        `MONOREPO.md doesn't contain mention about the ${p.name}`,
      );
    }
  }
}

async function checkCodeOwnersFile(packages, rootPath) {
  const excludes = ['@loopback/sandbox-example'];

  const codeOwnersFile = await fs.readFile('CODEOWNERS', 'utf8');

  for (const p of packages) {
    if (excludes.includes(p.name)) {
      continue;
    }

    const packagePath = path.relative(rootPath, p.location);

    if (!codeOwnersFile.includes(packagePath)) {
      throw new Error(
        `CODEOWNERS.md doesn't contain mention about the ${p.name}`,
      );
    }
  }
}

async function checkPkgsPackageJson(packages, rootPkg) {
  const pkgs = packages.filter(p => !p.private);

  function getCopyrightOwner(pkg) {
    return pkg['copyright.owner'] || (pkg.copyright && pkg.copyright.owner);
  }

  function wrongFieldValueError(packageName, field, original) {
    throw new Error(
      `${packageName} package.json has incorrect ${field} field value. It must be ${original}`,
    );
  }

  for (const p of pkgs) {
    const packageName = p.name;
    const pkg = fs.readJsonSync(path.join(p.location, 'package.json'));

    const isPublicAccess =
      pkg.publishConfig &&
      pkg.publishConfig.access &&
      pkg.publishConfig.access === 'public';

    if (!isPublicAccess) {
      throw new Error(
        `${p.name} package.json doesn't contain publicConfig.access equals public`,
      );
    }

    if (pkg.author !== rootPkg.author) {
      wrongFieldValueError(packageName, 'author', rootPkg.author);
    }

    if (getCopyrightOwner(pkg) !== getCopyrightOwner(rootPkg)) {
      wrongFieldValueError(
        packageName,
        'copyright.owner',
        getCopyrightOwner(rootPkg),
      );
    }

    if (pkg.license !== rootPkg.license) {
      wrongFieldValueError(packageName, 'license', rootPkg.license);
    }

    const isCorrectRepositoryUrl =
      pkg.repository && pkg.repository.url === rootPkg.repository.url;

    if (!isCorrectRepositoryUrl) {
      wrongFieldValueError(
        packageName,
        'repository.url',
        rootPkg.repository.url,
      );
    }

    const isCorrectRepositoryDirectory =
      pkg.repository && pkg.repository.directory && fs.existsSync(p.location);

    if (!isCorrectRepositoryDirectory) {
      throw new Error(`${packageName} directory doesn't exist in monorepo`);
    }
  }
}

async function checkPackagesMetadata() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();
  const rootPath = project.rootPath;
  const rootPkg = fs.readJsonSync('package.json');

  await checkLicenseFiles(packages);
  await checkMonorepoFile(packages, rootPath);
  await checkCodeOwnersFile(packages, rootPath);
  await checkPkgsPackageJson(packages, rootPkg);
}

if (require.main === module) {
  checkPackagesMetadata().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
