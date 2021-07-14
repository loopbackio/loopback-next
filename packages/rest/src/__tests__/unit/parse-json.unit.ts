// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {parseJson, sanitizeJsonParse} from '../../parse-json';

describe('parseJson', () => {
  it('throws for JSON text with __proto__ key', () => {
    const text = '{"x": "1", "__proto__": {"y": 2}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "__proto__" key.',
    );
  });

  it('throws for JSON text with __proto__.* key', () => {
    const text = '{"x": "1", "__proto__.abc": {"y": 2}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "__proto__.abc" key.',
    );
  });

  it('throws for JSON text with constructor/prototype key', () => {
    const text = '{"x": "1", "constructor": {"prototype": {"y": 2}}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "constructor.prototype" key.',
    );
  });

  it('throws for JSON text with constructor/prototype.xyz key', () => {
    const text = '{"x": "1", "constructor": {"prototype.xyz": {"y": 2}}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "constructor.prototype" key.',
    );
  });

  it('throws for JSON text with constructor.prototype key', () => {
    const text = '{"x": "1", "constructor.prototype": {"y": 2}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "constructor.prototype" key.',
    );
  });

  it('throws for JSON text with prohibited keys', () => {
    const text = '{"x": "1", "bad": {"prototype": {"y": 2}}}';
    expect(() =>
      parseJson(text, sanitizeJsonParse(undefined, ['bad'])),
    ).to.throw('JSON string cannot contain "bad" key.');
  });

  it('throws for JSON text with prohibited key prefixes', () => {
    const text = '{"x": "1", "bad.prop": {"prototype": {"y": 2}}}';
    expect(() =>
      parseJson(text, sanitizeJsonParse(undefined, ['bad'])),
    ).to.throw('JSON string cannot contain "bad.prop" key.');
  });

  it('throws for JSON text with deep __proto__ key', () => {
    const text = '{"x": "1", "y": {"__proto__": {"z": 2}}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "__proto__" key.',
    );
  });

  it('throws for JSON text with deep constructor.prototype key', () => {
    const text = '{"x": "1", "y": {"constructor": {"prototype": {"z": 2}}}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "constructor.prototype" key.',
    );
  });

  it('works for JSON text with deep __proto__ value', () => {
    const text = '{"x": "1", "y": "__proto__"}';
    expect(parseJson(text)).to.eql(JSON.parse(text));
  });

  it('supports reviver function', () => {
    const text = '{"x": 1, "y": "2"}';
    const obj = parseJson(text, (key, value) => {
      if (key === 'y') return parseInt(value);
      return value;
    });
    expect(obj).to.eql({x: 1, y: 2});
  });
});
