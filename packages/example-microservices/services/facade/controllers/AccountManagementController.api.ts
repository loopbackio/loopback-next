export const def = {
  basePath: '/',
  paths: {
    '/account/summary': {
      get: {
        'x-operation-name': 'getSummary',
        parameters: [
          {
            name: 'accountNumber',
            in: 'query',
            description: 'The account number to use when retrieving data from the underlying microservices.',
            required: true,
            type: 'string',
          }
        ],
        responses: {
          200: {
            schema: {
              accounts: {
                type: 'object',
                properties: {
                  accountNumber: {
                    type: 'string',
                    description: 'account number',
                  },
                  customerNumber: {
                    type: 'string',
                    description: 'customer number',
                  },
                  type: {
                    type: 'string',
                    description: 'savings or checking',
                  },
                  balance: {
                    type: 'number',
                    description: 'balance amount',
                  },
                  minimumBalance: {
                    type: 'number',
                    description: 'account minimum balance',
                  },
                  avgBalance: {
                    type: 'number',
                    description: 'average balance',
                  }
                }
              },
              customer: {
                type: 'array',
                items: [
                  {
                    type: 'object',
                    properties: {
                      customerNumber: {
                        type: 'string',
                        description: 'The information of customers',
                      },
                      firstName: {
                        type: 'string',
                        description: 'Fist Name of a customer',
                      },
                      lastName: {
                        type: 'string',
                        description: 'Last Name of a customer',
                      },
                      ssn: {
                        type: 'string',
                        description: 'SSN of a customer',
                      },
                      customerSince: {
                        type: 'datetime',
                        description: 'Duration of a customer',
                      },
                      street: {
                        type: 'string',
                        description: 'street of a customer',
                      },
                      state: {
                        type: 'string',
                        description: 'state of a customer',
                      },
                      city: {
                        type: 'string',
                        description: 'city of a customer',
                      },
                      zip: {
                        type: 'string',
                        description: 'zip of a customer',
                      },
                      lastUpdated: {
                        type: 'string',
                        description: 'lastUpdated date of address of customer',
                      },
                    }
                  }
                ]
              }
            },
          },
        },
      },
    },
    '/account/create': {
      post: {
        'x-operation-name': 'createAccount',
        parameters: [
          {
            name: 'accountInstance',
            in: 'body',
            description: 'The account instance.',
            required: true,
            type: 'object',
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              id: {
                type: 'string',
                description: 'The account id.',
              },
              customerNumber: {
                type: 'string',
                description: 'The customer number.',
              },
              balance: {
                type: 'number',
                description: 'The balance of the account.',
              },
              branch: {
                type: 'string',
                description: 'The bank branch.',
              },
              type: {
                type: 'string',
                description: 'The type of account ("savings" or "chequing").',
              },
              minimumBalance: {
                type: 'number',
                description: 'The minimum balance for the account.',
              },
              avgBalance: {
                type: 'number',
                description: 'The average balance of the account.',
              },
            },
          },
        },
      },
    }
  },
};
