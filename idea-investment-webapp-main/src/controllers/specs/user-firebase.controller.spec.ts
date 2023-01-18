import {SchemaObject} from '@loopback/rest';

const UserFirebaseSchema: SchemaObject = {
  type: 'object',
  required: ['token', 'device'],
  properties: {
    token: {
      type: 'string',
    },
    device: {
      type: 'string',
    },
  },
};

export const UserFirebaseRequest = {
  description: 'The input of create or update firebase token function',
  required: true,
  content: {
    'application/json': {schema: UserFirebaseSchema},
  },
};
