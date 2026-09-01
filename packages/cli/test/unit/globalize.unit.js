// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {expect} = require('@loopback/testlab');
const g = require('../../lib/globalize');

describe('globalize unit tests', () => {
  it('exports a globalize instance', () => {
    expect(g).to.be.an.Object();
  });

  it('has format method', () => {
    expect(g.f).to.be.a.Function();
  });

  it('formats simple strings', () => {
    const result = g.f('Hello World');
    expect(result).to.equal('Hello World');
  });

  it('formats strings with placeholders', () => {
    const result = g.f('Hello %s', 'World');
    expect(result).to.equal('Hello World');
  });

  it('formats strings with multiple placeholders', () => {
    const result = g.f('Hello %s, you are %d years old', 'John', 25);
    expect(result).to.equal('Hello John, you are 25 years old');
  });

  it('handles missing placeholders gracefully', () => {
    const result = g.f('Hello %s');
    expect(result).to.be.a.String();
  });

  it('has t method for translation', () => {
    expect(g.t).to.be.a.Function();
  });

  it('translates simple keys', () => {
    const result = g.t('test');
    expect(result).to.be.a.String();
  });

  it('has m method for message formatting', () => {
    expect(g.m).to.be.a.Function();
  });

  it('formats messages', () => {
    const result = g.m('test message');
    expect(result).to.be.a.String();
  });

  it('has c method for currency formatting', () => {
    expect(g.c).to.be.a.Function();
  });

  it('has n method for number formatting', () => {
    expect(g.n).to.be.a.Function();
  });

  it('has d method for date formatting', () => {
    expect(g.d).to.be.a.Function();
  });

  it('handles empty strings', () => {
    const result = g.f('');
    expect(result).to.equal('');
  });

  it('handles special characters', () => {
    const result = g.f('Test: %s!', 'special@#$');
    expect(result).to.match(/special/);
  });

  it('handles unicode characters', () => {
    const result = g.f('Hello %s', '世界');
    expect(result).to.equal('Hello 世界');
  });
});

// Made with Bob
