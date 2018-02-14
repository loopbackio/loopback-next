import {post, requestBody, getControllerSpec} from '../../../../../';
import {expect} from '@loopback/testlab';

// Just tired to create shortcuts for @requestBody after writing
// them for @param
// I will add shortcut decorators if we think they are valuable
// considering we are changing to DI soon
describe('requestBody shortcut', () => {
  it('infers request body with primative types', () => {
    class MyController {
      @post('/greetingWithString')
      greetWithString(@requestBody() name: string) {}
      @post('/greetingWithNumber')
      greetWithNumber(@requestBody() name: number) {}
      @post('/greetingWithBoolean')
      greetWithBoolean(@requestBody() name: boolean) {}
      @post('/greetingWithArray')
      greetWithArray(@requestBody() name: string[]) {}
      @post('/greetingWithObject')
      greetWitObejct(@requestBody() name: object) {}
      // @post('/greetingWithInteger')
      // greetWithInteger(@requestBody.integer() name: number) {}
      // @post('/greetingWithLong')
      // greetWithLong(@requestBody.long() name: number) {}
      // @post('/greetingWithFloat')
      // greetWithFloat(@requestBody.float() name: number) {}
      // @post('/greetingWithDouble')
      // greetWithDouble(@requestBody.double() name: number) {}
      // @post('/greetingWithByte')
      // greetWithByte(@requestBody.byte() name: string) {}
      // @post('/greetingWithBinary')
      // greetWithBinary(@requestBody.binary() name: string) {}
      // @post('/greetingWithDate')
      // greetWithDate(@requestBody.date() name: string) {}
      // @post('/greetingWithDateTime')
      // greetWithDateTime(@requestBody.dateTime() name: string) {}
      // @post('/greetingWithPassword')
      // greetWithPassword(@requestBody.password() name: string) {}
    }

    const actualSpec = getControllerSpec(MyController);
    const expectedContentWithString = {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    };
    const expectedContentWithNumber = {
      'application/json': {
        schema: {
          type: 'number',
        },
      },
    };
    const expectedContentWithBoolean = {
      'application/json': {
        schema: {
          type: 'boolean',
        },
      },
    };
    const expectedContentWithArray = {
      'application/json': {
        schema: {
          type: 'array',
        },
      },
    };
    const expectedContentWithObject = {
      'application/json': {
        schema: {
          type: 'object',
        },
      },
    };

    expect(
      actualSpec.paths['/greetingWithString']['post'].requestBody.content,
    ).to.eql(expectedContentWithString);
    expect(
      actualSpec.paths['/greetingWithNumber']['post'].requestBody.content,
    ).to.eql(expectedContentWithNumber);
    expect(
      actualSpec.paths['/greetingWithBoolean']['post'].requestBody.content,
    ).to.eql(expectedContentWithBoolean);
    expect(
      actualSpec.paths['/greetingWithArray']['post'].requestBody.content,
    ).to.eql(expectedContentWithArray);
    expect(
      actualSpec.paths['/greetingWithObject']['post'].requestBody.content,
    ).to.eql(expectedContentWithObject);
  });
});
