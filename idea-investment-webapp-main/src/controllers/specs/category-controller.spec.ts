import {SchemaObject} from '@loopback/rest';
import {CATEGORY_TYPE} from '../../enums';

const CategorySchema: SchemaObject = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: [CATEGORY_TYPE.article]
    },
    priority: {
      type: 'number'
    },
    parentId: {
      type: 'number'
    },
  }
};

export const CategoryRequest = {
  description: 'The input of create category function',
  required: true,
  content: {
      'application/json': {schema: CategorySchema},
  },
};
