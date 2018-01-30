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
            description:
              'The criteria used to narrow down the number of accounts returned.',
            required: true,
            type: 'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'array',
              $ref: '#/definitions/Account'
            }
          }
        }
      }
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
          }
        ],
        responses: {
          200: {
            schema: {
              $ref: '#/definitions/Account'
            }
          }
        }
      }
    },
    '/accounts/update': {
      post: {
        'x-operation-name': 'updateById',
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: 'The id of the model instance to be updated.',
            required: true,
            type: 'string'
          },
          {
            name: 'data',
            in: 'body',
            description: 'An object of model property name/value pairs.',
            required: true,
            type: 'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'object',
              description: 'Information about the updated record.',
              properties: {
                count: {
                  type: 'number',
                  description: 'The number of records updated.'
                }
              }
            }
          }
        }
      }
    },
    '/accounts/delete': {
      delete: {
        'x-operation-name': 'deleteById',
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: 'The ID for the model instance to be deleted.',
            required: true,
            type: 'object'
          }
        ],
        responses: {
          200: {
            schema: {
              type: 'object',
              description: 'Information on the deleted record.',
              properties: {
                count: {
                  type: 'number',
                  description: 'The number of records deleted.'
                }
              }
            }
          }
        }
      }
    }
  },
  definitions: {
    Account: {
      id: {
        type: 'string',
        description: 'The ID for the account instance.'
      },
      customerNumber: {
        type: 'string',
        description: 'The customer ID for the account instance.'
      },
      balance: {
        type: 'number',
        description: 'The current balance for the account instance.'
      },
      branch: {
        type: 'string',
        description: 'The branch location for the account instance.'
      },
      type: {
        type: 'string',
        description: 'The type of banking account.'
      },
      avgBalance: {
        type: 'number',
        description: 'The average balance for the account instance.'
      },
      minimumBalance: {
        type: 'number',
        description: 'The minimum balance for the account instance.'
      }
    }
  }
};
