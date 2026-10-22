// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/tsdocs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon} from '@loopback/testlab';
import path from 'path';
import {getUnscopedPackageName} from '../../helper';
import {runExtractorForPackage} from '../../monorepo-api-extractor';

// From dist/__tests__/unit, three levels up = packages/tsdocs
const TSDOCS_PKG_DIR = path.resolve(__dirname, '../../..');

describe('helper', () => {
  describe('getUnscopedPackageName()', () => {
    it('strips the @scope/ prefix from a scoped package name', () => {
      expect(getUnscopedPackageName('@loopback/context')).to.equal('context');
    });

    it('returns the name unchanged for an unscoped package', () => {
      expect(getUnscopedPackageName('express')).to.equal('express');
    });
  });
});

describe('runExtractorForPackage()', () => {
  let consoleLogStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub console.log to avoid noisy output and capture calls
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    consoleLogStub.restore();
  });

  it('logs the package name to console when silent is false (line 147)', () => {
    // Run against the actual tsdocs package so package.json resolves.
    // The extractor will succeed or throw — we only care about the log call.
    try {
      runExtractorForPackage(TSDOCS_PKG_DIR, {silent: false});
    } catch {
      // ignore extractor errors — we only want to verify the log branch
    }

    // console.log('> %s', pkg.name) should have been called
    sinon.assert.called(consoleLogStub);
    const firstCallArg = consoleLogStub.firstCall.args[0];
    expect(firstCallArg).to.equal('> %s');
  });
});
