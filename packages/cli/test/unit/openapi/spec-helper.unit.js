const expect = require('@loopback/testlab').expect;
const getMethodName = require('../../../generators/openapi/spec-helper')
  .getMethodName;

describe('Spec Helpers', () => {
  describe('getMethodName', () => {
    it('returns `x-operation-name` without `operationId` set.', () => {
      const spec = {
        'x-operation-name': 'foo',
      };

      const result = getMethodName(spec);

      expect(result).to.equal('foo');
    });

    it('returns `x-operation-name` with `operationId` set.', () => {
      const spec = {
        'x-operation-name': 'foo',
        operationId: 'bar',
      };

      const result = getMethodName(spec);

      expect(result).to.equal('foo');
    });

    it('returns `operationId` without `x-operation-name` set.', () => {
      const spec = {
        operationId: 'baz',
      };

      const result = getMethodName(spec);

      expect(result).to.equal('baz');
    });

    it('throws an error when neither `x-operation-name` nor `operationId` is set.', () => {
      const spec = {};

      const result = () => getMethodName(spec);

      expect(result).to.throw(
        'Could not infer method name from OpenAPI Operation Object. OpenAPI Operation Objects must have either `x-operation-name` or `operationId`.',
      );
    });
  });
});
