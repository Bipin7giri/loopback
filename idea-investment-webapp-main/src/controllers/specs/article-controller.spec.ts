import {SchemaObject} from '@loopback/rest';
import {ARTICLE_TYPE} from '../../enums';

const ArticleSchema: SchemaObject = {
  type: 'object',
  required: ['name'],
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    publishDate: {
      type: 'string',
      format: 'date-time'
    },
    type: {
      type: 'string',
      enum: [ARTICLE_TYPE.news, ARTICLE_TYPE.blog, ARTICLE_TYPE.update]
    },
    coverImageId: {
      type: 'number'
    },
    categories: {
      type: 'array',
      items: {
        type: 'number'
      }
    }
  }
};

export const ArticleRequest = {
  description: 'The input of create article function',
  required: true,
  content: {
      'application/json': {schema: ArticleSchema},
  },
};
