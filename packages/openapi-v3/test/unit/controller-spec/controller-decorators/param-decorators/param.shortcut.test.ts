import {expect} from '@loopback/testlab';
import {post, param, getControllerSpec} from '../../../../../';

describe('param shortcut', () => {
  it('javascript primitive types', () => {
    class MyController {
      @post('/users')
      createUser(
        @param.query.string('name') name: string,
        @param.query.number('age') age: number,
        @param.query.boolean('isNew') isNew: boolean,
      ) {}
    }

    const controllerSpec = getControllerSpec(MyController);
    const params = controllerSpec.paths['/users'].post.parameters;
    expect(params.length).to.eql(3);

    expect(params[0].schema.type).to.eql('string');
    expect(params[0].schema.format).to.eql(undefined);
    expect(params[1].schema.type).to.eql('number');
    expect(params[1].schema.format).to.eql(undefined);
    expect(params[2].schema.type).to.eql('boolean');
    expect(params[2].schema.format).to.eql(undefined);
  });
  it('OpenAPI 3.0.0 primative types', () => {
    class MyController {
      @post('/users')
      createUser(
        @param.query.integer('age') age: number,
        @param.query.long('SIN') SIN: number,
        @param.query.float('height') height: number,
        @param.query.double('foo') foo: number,
        @param.query.byte('file') file: string,
        @param.query.binary('image') image: string,
        @param.query.date('createdDate') createdDate: string,
        @param.query.dateTime('createdTime') createdTime: string,
        @param.query.password('password') password: string,
      ) {}
    }

    const controllerSpec = getControllerSpec(MyController);
    const params = controllerSpec.paths['/users'].post.parameters;
    expect(params.length).to.eql(9);

    expect(params[0].schema.type).to.eql('integer');
    expect(params[0].schema.format).to.eql('int32');
    expect(params[1].schema.type).to.eql('integer');
    expect(params[1].schema.format).to.eql('int64');
    expect(params[2].schema.type).to.eql('number');
    expect(params[2].schema.format).to.eql('float');
    expect(params[3].schema.type).to.eql('number');
    expect(params[3].schema.format).to.eql('double');
    expect(params[4].schema.type).to.eql('string');
    expect(params[4].schema.format).to.eql('byte');
    expect(params[5].schema.type).to.eql('string');
    expect(params[5].schema.format).to.eql('binary');
    expect(params[6].schema.type).to.eql('string');
    expect(params[6].schema.format).to.eql('date');
    expect(params[7].schema.type).to.eql('string');
    expect(params[7].schema.format).to.eql('date-time');
    expect(params[8].schema.type).to.eql('string');
    expect(params[8].schema.format).to.eql('password');
  });
});
