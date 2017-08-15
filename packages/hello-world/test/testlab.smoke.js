const expect = require('@loopback/testlab').expect;

describe('testlab smoke test', () => {
  it('supports the expect interface', () => {
    expect(expect).to.be.type('function');
  });

  it('supports basic operations', () => {
    expect(1).to.equal(1);
  });
});
