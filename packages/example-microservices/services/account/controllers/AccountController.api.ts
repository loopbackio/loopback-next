export const def = {
  basePath: '/',
  paths: {
    '/accounts': {
      get: {
        'x-operation-name': 'getAccount',
        parameters: [
          {
            name: 'filter',
            in: 'query',
            description: 'The criteria used to narrow down the number of accounts returned.',
            required: false,
            type: 'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'array',
              items: '#/definitions/Account'
            },
          },
        },
      },
    },
    '/accounts/create': {
      post: {
        'x-operation-name': 'createAccount',
        parameters: [
          {
            name: 'accountInstance',
            in: 'body',
            description: 'The account instance to create.',
            required: true,
            type: 'object'
          },
        ],
        responses: {
          200: {
            schema: {
              accountInstance: "#/definitions/Account"
            },
          },
        },
      },
    },
    '/accounts/update': {
      post: {
        'x-operation-name': 'updateAccount',
        parameters: [
          {
            name: 'where',
            in: 'query',
            description: 'The criteria used to narrow down the number of accounts returned.',
            required: false,
            type: 'object'
          },
         {
            name: 'data',
            in: 'body',
            description: 'An object of model property name/value pairs',
            required: true,
            type: 'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'object',
              description: 'update information',
              properties: {
                count: {
                  type: 'number',
                  description: 'number of records updated'
                }
              }
            },
          },
        },
      }
    },
    '/accounts/delete': {
      delete: {
        'x-operation-name': 'deleteAccount',
        parameters: [
          {
            name: 'where',
            in: 'query',
            description: 'The criteria used to narrow down which account instances to delete.',
            required: true,
            type:'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'object',
              description: 'delete information',
              properties: {
                count: {
                  type: 'number',
                  description: 'number of records deleted'
                }
              }
            },
          },
        },
      }
    }
  },
  definitions: {
    Account: require('../repositories/account/models/account/model-definition.json')
  }
};
