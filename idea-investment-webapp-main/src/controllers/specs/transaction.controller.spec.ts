import {SchemaObject} from '@loopback/rest';

export const TransactionSchema: SchemaObject = {
  type: 'object',
  required: ['referenceId', 'email', 'name', 'tokenId'],
  properties: {
    referenceId: {
      type: 'string'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    plan: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    tokenId: {
      type: 'string'
    }
  }
};

export const TransactionRequest = {
  description: 'The input of create transaction function',
  required: true,
  content: {
    'application/json': {schema: TransactionSchema},
  }
};
