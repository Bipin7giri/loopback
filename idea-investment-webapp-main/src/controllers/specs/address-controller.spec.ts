import {SchemaObject} from '@loopback/rest';

const AddressSchema: SchemaObject = {
  type: 'object',
  required: ['country', 'address'],
  properties: {
    country: {
      type: 'string'
    },
    postcode: {
      type: 'number'
    },
    address: {
      type: 'string'
    }
  }
};

export const AddressRequest = {
  description: 'The input of create address function',
  required: true,
  content: {
      'application/json': {schema: AddressSchema},
  },
};
