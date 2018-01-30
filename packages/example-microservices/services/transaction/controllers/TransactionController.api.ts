export const def = {
  basePath: '/',
  paths: {
    '/transactions': {
      get: {
        'x-operation-name': 'getTransactions',
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: 'The transaction id',
            required: true,
            type: 'string',
            format: 'JSON'
          },
          {
            name: 'filter',
            in: 'query',
            description: 'The criteria used to narrow down the number of transactions returned.',
            required: false,
            type: 'string',
            format: 'JSON'
          }
        ],
        responses: {
          200: {
            schema: {
              TransactionId: {
                type: 'string',
                description: 'The unique identifier for the transaction.',
              },
              dateTime: {
                type: 'date',
                description: 'The date and time of the transaction.'
              },
              accountNo: {
                type: 'string',
                description: 'The associated account number.'
              },
              amount: {
                type: 'number',
                description: 'The amount being consider in the transaction.'
              },
              transactionType: {
                type: 'string',
                description: 'The type of transaction. Can be "credit" or "debit".'
              }
            },
          },
        },
      },
    },
  },
};
