export const def = {
  basePath: '/',
  definitions: {
    todo: {
      id: {
        type: 'number',
        description: 'The ID number of the Todo entry.'
      },
      title: {
        type: 'string',
        description: 'The title of the Todo entry.'
      },
      body: {
        type: 'string',
        description: 'The body of the Todo entry.'
      }
    }
  },
  paths: {
    '/todo': {
      get: {
        'x-operation-name': 'get',
        parameters: [
          {
            name: 'title',
            in: 'query',
            description: 'The title of the todo entry.',
            required: false,
            type: 'string',
            format: 'JSON'
          },
          {
            name: 'filter',
            in: 'query',
            description: 'The title of the todo entry.',
            required: false,
            type: 'object',
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              $ref: '#/definitions/todo'
            }
          }
        }
      },
      post: {
        'x-operation-name': 'create',
        parameters: [
          {
            name: 'data',
            in: 'body',
            description: 'The Todo model instance.',
            required: true,
            format: 'JSON'
          }
        ],
        responses: {
          201: {
            schema: {
              $ref: '#/definitions/todo'
            }
          }
        }
      },
      delete: {
        'x-operation-name': 'delete',
        parameters: [
          {
            name: 'title',
            in: 'query',
            description:
              'The criteria used to narrow down the number of customers returned.',
            required: false,
            type: 'string',
            format: 'JSON'
          }
        ],
        responses: {
          204: {
            description: 'The resource has been deleted.'
          }
        }
      }
    },
    '/todo/{id}': {
      get: {
        'x-operation-name': 'getById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description:
              'The criteria used to narrow down the number of customers returned.',
            required: false,
            type: 'string',
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              $ref: '#/definitions/todo'
            }
          }
        }
      },
      put: {
        'x-operation-name': 'replace',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The todo ID.',
            required: true,
            type: 'string',
            format: 'JSON'
          },
          {
            name: 'data',
            in: 'body',
            description: 'The Todo model instance.',
            required: true,
            format: 'JSON'
          }
        ],
        responses: {
          201: {
            schema: {
              $ref: '#/definitions/todo'
            }
          }
        }
      },
      patch: {
        'x-operation-name': 'update',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The todo ID.',
            required: true,
            type: 'string',
            format: 'JSON'
          },
          {
            name: 'data',
            in: 'body',
            description: 'The Todo model instance.',
            required: true,
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              $ref: '#/definitions/todo'
            }
          }
        }
      },
      delete: {
        'x-operation-name': 'deleteById',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The todo ID.',
            required: false,
            type: 'string',
            format: 'JSON'
          }
        ],
        responses: {
          204: {
            description: 'The resource has been deleted.'
          }
        }
      }
    }
  }
};
