const assert = require('assert');

describe('testlab smoke test', () => {
  it('exports expect interface', () => {
    const testlab = require('..');
    assert.equal(typeof testlab.expect, 'function');
  });
});
