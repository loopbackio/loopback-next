export const def = {
  basePath: '/',
  paths: {
    '/customers': {
      get: {
        'x-operation-name': 'getCustomers',
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: 'The customer id.',
            required: true,
            type: 'string',
            format: 'JSON'
          },
          {
            name: 'filter',
            in: 'query',
            description: 'The criteria used to narrow down the number of customers returned.',
            required: false,
            type: 'string',
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              customerNumber: {
                type: 'string',
                description: 'The customer number.',
              },
              firstName: {
                type: 'string',
                description: 'The customer\'s first name.',
              },
              lastName: {
                type: 'string',
                description: 'The customer\'s last name.',
              },
              ssn: {
                type: 'string',
                description: 'The customer\'s social security number.',
              },
              customerSince: {
                type: 'datetime',
                description: 'The customer\'s registration date.'
              },
              street: {
                type: 'string',
                description: 'The street name of the customer\'s address.',
              },
              state: {
                type: 'string',
                description: 'The state of the customer\'s address.',
              },
              city: {
                type: 'string',
                description: 'The city of the customer\'s address.',
              },
              zip: {
                type: 'string',
                description: 'The zip code of the customer\'s address.',
              },
              lastUpdated: {
                type: 'string',
                description: 'The last time the customer\'s information was updated.',
              },
            },
          },
        },
      },
    },
  },
};
