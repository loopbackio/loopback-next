// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {RestBindings} from '../..';
import {RestTags} from '../../keys';
import {AjvFormat, AjvKeyword} from '../../types';
import {AjvFactoryProvider} from '../../validation/ajv-factory.provider';

describe('Ajv factory', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('allows binary format by default', async () => {
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'string', format: 'binary'});
    const result = await validator('ABC123');
    expect(result).to.be.true();
  });

  it('honors request body parser options', async () => {
    ctx
      .bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS)
      .to({validation: {unknownFormats: ['gmail']}});
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'string', format: 'gmail'});
    const result = await validator('example@gmail.com');
    expect(result).to.be.true();
  });

  it('honors extra options', async () => {
    ctx.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({validation: {}});
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory({coerceTypes: true}).compile({type: 'number'});
    const result = await validator('123');
    expect(result).to.be.true();
  });

  it('accepts request body parser options via constructor', async () => {
    const ajvFactory = new AjvFactoryProvider({
      unknownFormats: ['gmail'],
    }).value();
    const validator = ajvFactory().compile({type: 'string', format: 'gmail'});
    const result = await validator('example@gmail.com');
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
        const result = await validator(value);
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
        const result = await validator({
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
        const result = await validator(value);
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
        const result = await validator({
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
    ).to.throw(/unknown format "gmail" is used in schema/);
  });

  it('honors keyword extensions', async () => {
    ctx
      .bind<AjvKeyword>('ajv.keywords.smallNumber')
      .to({
        name: 'smallNumber',
        type: 'number',
        validate: (schema: unknown, data: number) => {
          // The number is smaller than 10
          return data < 10;
        },
      })
      .tag(RestTags.AJV_KEYWORD);
    const ajvFactory = await ctx.get(RestBindings.AJV_FACTORY);
    const validator = ajvFactory().compile({type: 'number', smallNumber: true});
    let result = await validator(1);
    expect(result).to.be.true();
    result = await validator(20);
    expect(result).to.be.false();
  });

  it('honors format extensions', async () => {
    ctx
      .bind<AjvFormat>('ajv.formats.int')
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
    let result = await validator(1);
    expect(result).to.be.true();
    result = await validator(1.5);
    expect(result).to.be.false();
  });

  function givenContext() {
    ctx = new Context();
    ctx.bind(RestBindings.AJV_FACTORY).toProvider(AjvFactoryProvider);
  }
});
