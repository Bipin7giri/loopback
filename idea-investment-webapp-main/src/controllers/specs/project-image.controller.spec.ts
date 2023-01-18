import {SchemaObject} from '@loopback/rest';

const ProjectImageSchema: SchemaObject = {
  type: 'object',
  required: ['projectId', 'mediaId'],
  properties: {
    projectId: {
      type: 'number',
    },
    mediaId: {
      type: 'number',
    },
  },
};

export const ProjectImageRequest = {
  description: 'The input of create project images',
  require: true,
  content: {
    'application/json': {
      schema: ProjectImageSchema,
    },
  },
};
