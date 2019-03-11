// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {parseJson} from '../../parse-json';

describe('parseJson', () => {
  it('throws for JSON text with __proto__ key', () => {
    const text = '{"x": "1", "__proto__": {"y": 2}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "__proto__" key.',
    );
  });

  it('throws for JSON text with deep __proto__ key', () => {
    const text = '{"x": "1", "y": {"__proto__": {"z": 2}}}';
    expect(() => parseJson(text)).to.throw(
      'JSON string cannot contain "__proto__" key.',
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
