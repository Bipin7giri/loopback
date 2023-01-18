import {SchemaObject} from '@loopback/rest';

const RoleSchema: SchemaObject = {
  type: 'object',
  required: ['name', 'permissions'],
  properties: {
    name: {
      type: 'string'
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

export const RoleRequest = {
  description: 'The input of create role function',
  required: true,
  content: {
      'application/json': {schema: RoleSchema},
  },
};
