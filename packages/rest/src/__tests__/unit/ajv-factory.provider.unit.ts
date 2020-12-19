// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {FuncKeywordDefinition} from 'ajv';
import {RestBindings} from '../..';
import {RestTags} from '../../keys';
import {AjvFormat} from '../../types';
import {AjvFactoryProvider} from '../../validation/ajv-factory.provider';

describe('Ajv factory', () => {
  let ctx: Context;

  beforeEach(givenContext);

  context('OpenAPI formats', () => {
    it('allows binary format by default', async () => {
      const validator = getValidator('string', 'binary');
      const result = validator('ABC123');
      expect(result).to.be.true();
    });

    it('supports int32 format by default', async () => {
      const validator = getValidator('number', 'int32');
      const result = validator(123);
      expect(result).to.be.true();
    });

    it('reports non-integer int32 value', async () => {
      const validator = getValidator('number', 'int32');
      const result = validator(123.3);
      expect(result).to.be.false();
    });

    it('reports out-of-range int32 value', async () => {
      const validator = getValidator('number', 'int32');
      let result = validator(21474836470);
      expect(result).to.be.false();
      result = validator(-21474836470);
      expect(result).to.be.false();
    });

    it('supports int64 format by default', async () => {
      const validator = getValidator('number', 'int64');
      const result = validator(123);
      expect(result).to.be.true();
    });

    it('reports non-integer int64 value', async () => {
      const validator = getValidator('number', 'int64');
      const result = validator(123.3);
      expect(result).to.be.false();
    });

    it('reports out-of-range int64 value', async () => {
      const validator = getValidator('number', 'int64');
      let result = validator(Infinity);
      expect(result).to.be.false();
      result = validator(Number.NEGATIVE_INFINITY);
      expect(result).to.be.false();
    });

    it('allows max int64 value', async () => {
      const validator = getValidator('number', 'int64');
      let result = validator(Number.MIN_SAFE_INTEGER);
      expect(result).to.be.true();
      result = validator(Number.MAX_SAFE_INTEGER);
      expect(result).to.be.true();
    });

    it('supports float format by default', async () => {
      const validator = getValidator('number', 'float');
      const result = validator(123);
      expect(result).to.be.true();
    });

    it('reports out-of-range float value', async () => {
      const validator = getValidator('number', 'float');
      let result = validator(Number.MAX_VALUE);
      expect(result).to.be.false();
      result = validator(-Number.MAX_VALUE);
      expect(result).to.be.false();
    });

    it('supports double format by default', async () => {
      const validator = getValidator('number', 'double');
      const result = validator(123);
      expect(result).to.be.true();
    });

    it('reports out-of-range double value', async () => {
      const validator = getValidator('number', 'double');
      let result = validator(Infinity);
      expect(result).to.be.false();
      result = validator(Number.NEGATIVE_INFINITY);
      expect(result).to.be.false();
    });

    it('supports byte format by default', async () => {
      const validator = getValidator('string', 'byte');

      const base64 = Buffer.from('XYZ123@$').toString('base64');
      const result = validator(base64);
      expect(result).to.be.true();
    });

    it('reports invalid byte value', async () => {
      const validator = getValidator('string', 'byte');

      const invalidBase64 = 'XYZ123@$';
      const result = validator(invalidBase64);
      expect(result).to.be.false();
    });

    function getValidator(type: string, format: string) {
      const ajvFactory = ctx.getSync(RestBindings.AJV_FACTORY);
      const validator = ajvFactory().compile({
        type,
        format,
      });
      return validator;
    }
  });

  it('honors request body parser options', async () => {
    ctx
      .bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS)
      .to({validation: {formats: {gmail: val => val.endsWith('@gmail.com')}}});
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'string', format: 'gmail'});
    const result = validator('example@gmail.com');
    expect(result).to.be.true();
  });

  it('honors extra options', async () => {
    ctx.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({validation: {}});
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory({coerceTypes: true}).compile({type: 'number'});
    const result = validator('123');
    expect(result).to.be.true();
  });

  it('accepts request body parser options via constructor', async () => {
    const ajvFactory = new AjvFactoryProvider({
      formats: {gmail: val => val.endsWith('@gmail.com')},
    }).value();
    const validator = ajvFactory().compile({type: 'string', format: 'gmail'});
    const result = validator('example@gmail.com');
    expect(result).to.be.true();
  });

  // possible values for type any
  const TEST_VALUES = {
    string: 'abc',
    number: 123,
    object: {random: 'random'},
    array: [1, 2, 3],
    null: null,
  };

  context('accepts any type with schema {}', () => {
    for (const v in TEST_VALUES) {
      testAnyTypeWith(v);
    }

    function testAnyTypeWith(value: string) {
      it(`with value ${value}`, async () => {
        const ajvFactory = new AjvFactoryProvider().value();
        const validator = ajvFactory().compile({});
        const result = validator(value);
        expect(result).to.be.true();
      });
    }
  });

  context('accepts any type with schema {} - property', () => {
    for (const v in TEST_VALUES) {
      testAnyTypeWith(v);
    }

    function testAnyTypeWith(value: string) {
      it(`with value ${value}`, async () => {
        const ajvFactory = new AjvFactoryProvider().value();
        const validator = ajvFactory().compile({
          type: 'object',
          properties: {
            name: {type: 'string'},
            arbitraryProp: {},
          },
        });
        const result = validator({
          name: 'Zoe',
          arbitraryProp: value,
        });
        expect(result).to.be.true();
      });
    }
  });

  context('accepts any type with schema true', () => {
    for (const v in TEST_VALUES) {
      testAnyTypeWith(v);
    }

    function testAnyTypeWith(value: string) {
      it(`with value ${value}`, async () => {
        const ajvFactory = new AjvFactoryProvider().value();
        const validator = ajvFactory().compile(true);
        const result = validator(value);
        expect(result).to.be.true();
      });
    }
  });

  context('accepts any type with schema true - property', () => {
    for (const v in TEST_VALUES) {
      testAnyTypeWith(v);
    }

    function testAnyTypeWith(value: string) {
      it(`with value ${value}`, async () => {
        const ajvFactory = new AjvFactoryProvider().value();
        const validator = ajvFactory().compile({
          type: 'object',
          properties: {
            name: {type: 'string'},
            arbitraryProp: true,
          },
        });
        const result = validator({
          name: 'Zoe',
          arbitraryProp: value,
        });
        expect(result).to.be.true();
      });
    }
  });

  it('reports unknown format', async () => {
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    expect(() =>
      ajvFactory().compile({type: 'string', format: 'gmail'}),
    ).to.throw(/unknown format "gmail" ignored in schema at path "#"/);
  });

  it('honors keyword extensions', async () => {
    ctx
      .bind<FuncKeywordDefinition>('ajv.keywords.smallNumber')
      .to({
        keyword: 'smallNumber',
        type: 'number',
        validate: (schema: unknown, data: number) => {
          // The number is smaller than 10
          return data < 10;
        },
      })
      .tag(RestTags.AJV_KEYWORD);
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'number', smallNumber: true});
    let result = validator(1);
    expect(result).to.be.true();
    result = validator(20);
    expect(result).to.be.false();
  });

  it('honors format extensions', async () => {
    ctx
      .bind<AjvFormat<number>>('ajv.formats.int')
      .to({
        name: 'int',
        type: 'number',
        validate: (data: number) => {
          // The number does not have a decimal point
          return !String(data).includes('.');
        },
      })
      .tag(RestTags.AJV_FORMAT);
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'number', format: 'int'});
    let result = validator(1);
    expect(result).to.be.true();
    result = validator(1.5);
    expect(result).to.be.false();
  });

  function givenContext() {
    ctx = new Context();
    ctx.bind(RestBindings.AJV_FACTORY).toProvider(AjvFactoryProvider);
  }
});
