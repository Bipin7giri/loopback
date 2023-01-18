import {SchemaObject} from '@loopback/rest';

const OrderSchema: SchemaObject = {
  type: 'object',
  required: ['amount', 'projectId'],
  properties: {
    amount: {
      type: 'number',
      minimum: 0.5
    },
    currency:{
      type:'string'
    },
    referenceId:{
      type:'string'
    },
    projectId: {
      type: 'number',
      minimum: 1
    }
  }
};
export const OrderRequest = {
  description: 'The input of create order function',
  required: true,
  content: {
      'application/json': {schema: OrderSchema},
  },
};
