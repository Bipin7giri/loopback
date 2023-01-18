import {SchemaObject} from '@loopback/rest';

const WishlistSchema: SchemaObject = {
  type: 'object',
  required: ['projectId'],
  properties: {
    projectId: {
      type: 'string',
    }
  }
};

export const WishlistRequest = {
  description: 'The input of create wishlist function',
  required: true,
  content: {
    'application/json': {schema: WishlistSchema},
  },
}
