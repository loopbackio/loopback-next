// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {deserialize} from '../..';
import {expect} from '@loopback/testlab';
import {ParameterObject} from '@loopback/openapi-v3-types';

// tslint:disable:no-any
describe('deserializer', () => {
  it('converts number parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'balance',
      schema: {
        type: 'number',
      },
    };
    expectToDeserialize(param, [0, 1.5, '10', '2.5'], [0, 1.5, 10, 2.5]);
    expectToDeserializeNullOrUndefined(param);
  });

  it('reports errors for invalid number parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'balance',
      schema: {
        type: 'number',
      },
    };
    expectToFail(
      param,
      ['a', 'a1', 'true', true, false, {}, new Date()],
      /Invalid value .* for parameter balance\: number/,
    );
  });

  it('converts integer parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'id',
      schema: {
        type: 'integer',
      },
    };
    expectToDeserialize(param, [0, -1, '10', '-5'], [0, -1, 10, -5]);
  });

  it('reports erros for invalid integer parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'id',
      schema: {
        type: 'integer',
      },
    };
    expectToFail(
      param,
      ['a', 'a1', 'true', {}, 1.5, '-2.5'],
      /Invalid value .* for parameter id\: integer/,
    );
  });

  it('converts boolean parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'vip',
      schema: {
        type: 'boolean',
      },
    };
    expectToDeserialize(
      param,
      [true, false, 'true', 'false'],
      [true, false, true, false],
    );
    expectToDeserializeNullOrUndefined(param);
  });

  it('reports errors for invalid boolean parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'vip',
      schema: {
        type: 'boolean',
      },
    };
    expectToFail(
      param,
      ['a', 'a1', {}, 1.5, 0, 1, -10],
      /Invalid value .* for parameter vip\: boolean/,
    );
  });

  it('converts string parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'name',
      schema: {
        type: 'string',
      },
    };
    expectToDeserialize(param, ['', 'A'], ['', 'A']);
    expectToDeserializeNullOrUndefined(param);
  });

  it('reports errors for invalid string parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'name',
      schema: {
        type: 'string',
      },
    };
    expectToFail(
      param,
      [true, false, 0, -1, 2.5, {}, new Date()],
      /Invalid value .* for parameter name\: string/,
    );
  });

  it('converts date parameters', () => {
    const param: ParameterObject = {
      in: 'query',
      name: 'date',
      schema: {
        type: 'string',
        format: 'date',
      },
    };
    const date = new Date();
    expectToDeserialize(param, [date.toJSON()], [date]);
  });

  describe('string[]', () => {
    it('converts csv format', () => {
      const param: ParameterObject = {
        in: 'query',
        name: 'nums',
        style: 'simple',
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      };
      expectToDeserialize(
        param,
        ['1,2,3', 'ab,c'],
        [['1', '2', '3'], ['ab', 'c']],
      );
    });

    it('converts ssv format', () => {
      const param: ParameterObject = {
        in: 'query',
        name: 'nums',
        style: 'spaceDelimited',
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      };
      expectToDeserialize(
        param,
        ['1 2 3', 'ab c'],
        [['1', '2', '3'], ['ab', 'c']],
      );
    });

    it('converts pipes format', () => {
      const param: ParameterObject = {
        in: 'query',
        name: 'nums',
        style: 'pipeDelimited',
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      };
      expectToDeserialize(
        param,
        ['1|2|3', 'ab|c'],
        [['1', '2', '3'], ['ab', 'c']],
      );
    });
  });

  describe('number[]', () => {
    it('converts csv format', () => {
      const param: ParameterObject = {
        in: 'query',
        name: 'nums',
        style: 'simple',
        schema: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      };
      expectToDeserialize(param, ['1,2,3', '-10,2.5'], [[1, 2, 3], [-10, 2.5]]);
    });
  });

  function expectToDeserialize(
    param: ParameterObject,
    source: any[],
    target: any[],
  ) {
    expect(source.map(i => deserialize(i, param))).to.eql(target);
  }

  function expectToDeserializeNullOrUndefined(param: ParameterObject) {
    expect(deserialize(null, param)).to.be.null();
    expect(deserialize(undefined, param)).to.be.undefined();
  }

  function expectToFail(
    param: ParameterObject,
    source: any[],
    reason: string | RegExp,
  ) {
    for (const i of source) {
      expect(() => deserialize(i, param)).to.throw(reason);
    }
  }
});
