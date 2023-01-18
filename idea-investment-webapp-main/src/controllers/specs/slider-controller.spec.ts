import {SchemaObject} from '@loopback/rest';

const SliderSchema: SchemaObject = {
  type: 'object',
  //required: ['name'],
  properties: {
    name: {
      type: 'string',
    },
    isActive: {
      type: 'boolean',
    },
    imageId: {
      type: 'number',
    },
    priority: {
      type: 'number',
    },
  },
};

export const SliderRequest = {
  description: 'The input of create slider function',
  required: true,
  content: {
    'application/json': {schema: SliderSchema},
  },
};
