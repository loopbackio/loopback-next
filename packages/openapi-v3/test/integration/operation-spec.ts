import {expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';
import {param, requestBody, getControllerSpec, post} from '../../';

describe('operation arguments', () => {
  it('generate parameters and requestBody for operation', () => {
    @model()
    class User {
      @property() name: string;
      @property() password: number;
    }

    class MyController {
      @post('/users')
      async createUser(
        @param.query.string('type') type: string,
        @param.header.string('token') token: string,
        @param.cookie.string('session') session: string,
        @param.path.string('location') location: string,
        @requestBody() user: User,
      ): Promise<void> {
        return;
      }
    }

    const expectedSpec = {
      paths: {
        '/users': {
          post: {
            responses: {},
            parameters: [
              {name: 'type', in: 'query', schema: {type: 'string'}},
              {name: 'token', in: 'header', schema: {type: 'string'}},
              {name: 'session', in: 'cookie', schema: {type: 'string'}},
              {name: 'location', in: 'path', schema: {type: 'string'}},
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {$ref: '#/components/schemas/User'},
                },
              },
              'x-parameter-index': 4,
            },
            'x-operation-name': 'createUser',
          },
        },
      },
      components: {
        schemas: {
          User: {
            title: 'User',
            properties: {name: {type: 'string'}, password: {type: 'number'}},
          },
        },
      },
    };
    expect(getControllerSpec(MyController)).to.eql(expectedSpec);
  });
});
