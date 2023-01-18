import {SchemaObject} from '@loopback/rest';

const CompanySchema: SchemaObject = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string'
    },
    information: {
      type: 'string'
    },
    coverImageId: {
      type: 'number'
    },
    logoId: {
      type: 'number'
    },
  }
};

export const CompanyRequest = {
  description: 'The input of create company function',
  required: true,
  content: {
      'application/json': {schema: CompanySchema},
  },
};
