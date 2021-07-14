// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {dirname, join, resolve} from 'path';
import {expect, TestSandbox} from '../..';

const SANDBOX_PATH = resolve(__dirname, '../../.sandbox');

describe('TestSandbox', () => {
  it('creates a subdir by default', () => {
    const sandbox = new TestSandbox(SANDBOX_PATH);
    expect(sandbox.path).to.not.eql(SANDBOX_PATH);
    expect(dirname(sandbox.path)).to.eql(SANDBOX_PATH);
  });

  it('creates a unique subdir by default', () => {
    const sandbox1 = new TestSandbox(SANDBOX_PATH);
    const sandbox2 = new TestSandbox(SANDBOX_PATH);
    expect(sandbox1.path).to.not.eql(sandbox2.path);
  });

  it('creates a unique subdir if it is true', () => {
    const sandbox1 = new TestSandbox(SANDBOX_PATH, {subdir: true});
    const sandbox2 = new TestSandbox(SANDBOX_PATH, {subdir: true});
    expect(sandbox1.path).to.not.eql(sandbox2.path);
  });

  it('creates a named subdir', () => {
    const sandbox = new TestSandbox(SANDBOX_PATH, {subdir: 'd1'});
    expect(sandbox.path).to.not.eql(SANDBOX_PATH);
    expect(dirname(sandbox.path)).to.eql(SANDBOX_PATH);
    expect(sandbox.path).to.eql(join(SANDBOX_PATH, 'd1'));
  });

  it('does not creates a subdir if it is false', () => {
    const sandbox = new TestSandbox(SANDBOX_PATH, {subdir: false});
    expect(sandbox.path).to.eql(SANDBOX_PATH);
  });

  it("does not creates a subdir if it is '.'", () => {
    const sandbox = new TestSandbox(SANDBOX_PATH, {subdir: '.'});
    expect(sandbox.path).to.eql(SANDBOX_PATH);
  });

  it("does not creates a subdir if it is ''", () => {
    const sandbox = new TestSandbox(SANDBOX_PATH, {subdir: ''});
    expect(sandbox.path).to.eql(SANDBOX_PATH);
  });
});
