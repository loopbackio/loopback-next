// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {once} from 'events';
import fs from 'fs-extra';
import path from 'path';
import {runExtractorForMonorepo, updateApiDocs} from '../..';
import {runExtractorForPackage} from '../../monorepo-api-extractor';

const runCLI = require('@loopback/build').runCLI;

const MONOREPO_ROOT = path.dirname(
  require.resolve('@loopback/tsdocs-monorepo/package.json'),
);
const APIDOCS_ROOT = path.join(MONOREPO_ROOT, 'docs/apidocs');
const SITE_APIDOCS_ROOT = path.join(MONOREPO_ROOT, 'docs/site/apidocs');

describe('tsdocs', function (this: Mocha.Suite) {
  this.timeout(10000);

  const API_MD_FILES = [
    'index.md',
    'pkg1.md',
    // It was `'pkg1.pet._constructor_.md'` before
    // https://github.com/microsoft/web-build-tools/pull/1410
    'pkg1.pet._constructor_.md',
    'pkg1.pet.greet.md',
    'pkg1.pet.kind.md',
    'pkg1.pet.md',
    'pkg1.pet.name.md',
    'pkg2.dog.kind.md',
    'pkg2.dog.md',
    'pkg2.md',
  ];

  before('remove apidocs', () => {
    fs.emptyDirSync(APIDOCS_ROOT);
    fs.emptyDirSync(SITE_APIDOCS_ROOT);
    fs.emptyDirSync(path.join(MONOREPO_ROOT, 'packages/pkg1/docs'));
  });

  let originalConsoleLog: typeof console.log;

  before(function setupConsoleLogInterceptor() {
    originalConsoleLog = console.log;
    console.log = function (...args: unknown[]) {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      const ignore =
        msg &&
        (/Analysis will use the bundled TypeScript version/.test(msg) ||
          /The target project appears to use TypeScript/.test(msg));
      if (ignore) return;
      process.stdout.write('XX: ' + require('util').inspect(args));
      originalConsoleLog(...args);
    };
  });

  after(function uninstallConsoleLogInterceptor() {
    console.log = originalConsoleLog;
  });

  it('runs api-extractor', async () => {
    await runExtractorForMonorepo({
      rootDir: MONOREPO_ROOT,
      silent: true,
      apiDocsGenerationPath: 'docs/apidocs',
      apiReportEnabled: true,
    });

    const dirs = await fs.readdir(APIDOCS_ROOT);
    expect(dirs.sort()).eql(['models', 'reports', 'reports-temp']);

    const models = await fs.readdir(path.join(APIDOCS_ROOT, 'models'));
    expect(models.sort()).to.eql(['pkg1.api.json', 'pkg2.api.json']);

    const reports = await fs.readdir(path.join(APIDOCS_ROOT, 'reports'));
    expect(reports.sort()).to.eql(['pkg1.api.md', 'pkg2.api.md']);
  });

  it('runs api-extractor on package only', async () => {
    const pkgDir = path.join(MONOREPO_ROOT, 'packages/pkg1');
    const apidocsRootDir = path.join(pkgDir, 'docs/apidocs');

    runExtractorForPackage(pkgDir, {
      silent: true,
      apiDocsGenerationPath: 'docs/apidocs',
      apiReportEnabled: true,
    });

    const dirs = await fs.readdir(apidocsRootDir);
    expect(dirs.sort()).eql(['models', 'reports', 'reports-temp']);

    const models = await fs.readdir(path.join(apidocsRootDir, 'models'));
    expect(models.sort()).to.eql(['pkg1.api.json']);

    const reports = await fs.readdir(path.join(apidocsRootDir, 'reports'));
    expect(reports.sort()).to.eql(['pkg1.api.md']);
  });

  it('runs api-documenter', async () => {
    const args = [
      'markdown',
      '-i',
      path.join(APIDOCS_ROOT, 'models'),
      '-o',
      SITE_APIDOCS_ROOT,
    ];
    process.chdir(path.join(__dirname, '../../..'));
    const child = runCLI('@microsoft/api-documenter/lib/start', args, {
      stdio: 'ignore',
    });
    await once(child, 'close');
    const files = await fs.readdir(SITE_APIDOCS_ROOT);
    expect(files.sort()).eql(API_MD_FILES);
  });

  it('updates apidocs for site', async () => {
    await updateApiDocs({
      rootDir: MONOREPO_ROOT,
      silent: true,
      apiDocsGenerationPath: 'docs/site/apidocs',
    });

    const files = await fs.readdir(SITE_APIDOCS_ROOT);
    expect(files.sort()).to.eql(API_MD_FILES);

    for (const f of files) {
      const md = await fs.readFile(path.join(SITE_APIDOCS_ROOT, f), 'utf-8');
      expect(md).to.match(/lang\: en/);
      expect(md).to.match(/sidebar\: lb4_sidebar/);
    }

    let index = await fs.readFile(
      path.join(SITE_APIDOCS_ROOT, 'index.md'),
      'utf-8',
    );
    // Remove \r
    index = index.replace(/\r/gm, '');
    expect(index).to.containEql(`---
lang: en
title: 'API docs: index'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
editurl: https://github.com/strongloop/loopback-next
permalink: /doc/en/lb4/apidocs.index.html
---`);

    expect(index).to.containEql('[Home](./index.md)');
    expect(index).to.containEql('## Packages');

    expect(index).to.containEql(`
|  Package | Description |
|  --- | --- |
|  [pkg1](./pkg1.md) |  |
|  [pkg2](./pkg2.md) |  |
`);

    const constructorDoc = await fs.readFile(
      path.join(SITE_APIDOCS_ROOT, 'pkg1.pet._constructor_.md'),
      'utf-8',
    );
    expect(constructorDoc).to.not.match(/\.\(constructor\)\.md/);
    expect(constructorDoc).to.match(
      /editurl\: https\:\/\/github\.com\/strongloop\/loopback\-next\/tree\/master\/packages\/pkg1/,
    );

    const pkgDoc = await fs.readFile(
      path.join(SITE_APIDOCS_ROOT, 'pkg1.md'),
      'utf-8',
    );
    expect(pkgDoc).to.match(
      /\[pkg1\]\(https\:\/\/github\.com\/strongloop\/loopback\-next\/tree\/master\/packages\/pkg1\)/,
    );
    expect(pkgDoc).to.match(
      /editurl\: https\:\/\/github\.com\/strongloop\/loopback\-next\/tree\/master\/packages\/pkg1/,
    );
  });
});
