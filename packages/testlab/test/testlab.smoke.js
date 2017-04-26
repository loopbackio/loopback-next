const should = require('should');
const testlab = require('..');

describe('testlab smoke test', () => {
  it('exports expect interface', () => {
    testlab.expect.should.be.type('function');
  });
});
