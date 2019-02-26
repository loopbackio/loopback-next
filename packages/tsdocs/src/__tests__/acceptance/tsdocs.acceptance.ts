// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as fs from 'fs-extra';
import pEvent from 'p-event';
import * as path from 'path';
import {runExtractorForMonorepo, updateApiDocs} from '../..';

const runCLI = require('@loopback/build').runCLI;

const MONOREPO_ROOT = path.join(__dirname, '../../../fixtures/monorepo');
const APIDOCS_ROOT = path.join(MONOREPO_ROOT, 'docs/apidocs');
const SITE_APIDOCS_ROOT = path.join(MONOREPO_ROOT, 'docs/site/apidocs');

describe('tsdocs', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(10000);

  const API_MD_FILES = [
    'pkg1.md',
    'pkg1.pet.(constructor).md',
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
    await pEvent(child, 'close');
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
    expect(files.sort()).to.eql(['index.md', ...API_MD_FILES]);

    for (const f of files) {
      const md = await fs.readFile(path.join(SITE_APIDOCS_ROOT, f), 'utf-8');
      expect(md).to.match(/lang\: en/);
      expect(md).to.match(/sidebar\: lb4_sidebar/);
    }

    const index = await fs.readFile(
      path.join(SITE_APIDOCS_ROOT, 'index.md'),
      'utf-8',
    );
    expect(index).to.eql(`---
lang: en
title: 'API docs'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/apidocs.index.html
---

## API Docs
- [pkg1](pkg1.md)
- [pkg2](pkg2.md)

`);
  });
});
