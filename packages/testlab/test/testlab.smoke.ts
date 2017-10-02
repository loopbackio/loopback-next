import * as assert from 'assert';
import * as testlab from '..';

describe('testlab smoke test', () => {
  it('exports expect interface', () => {
    assert.equal(typeof testlab.expect, 'function');
  });
});
