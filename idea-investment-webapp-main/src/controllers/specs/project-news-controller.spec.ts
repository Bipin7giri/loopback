import {SchemaObject} from '@loopback/rest';

const projectNews = (require: string[]): SchemaObject => ({
  type: 'object',
  required: require,
  properties: {
    title: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    authorId: {
      type: 'number',
    },
    projectId: {
      type: 'number',
    },
  },
});

// FIXME: Check if the project patch requires
const ProjectNewsSchema: SchemaObject = projectNews([
  'title',
  'content',
  'projectId',
]);

const ProjectNewsSchemaPatch: SchemaObject = projectNews([]);

export const ProjectNewsRequestPatch = {
  description: 'The input of update ProjectNewsRequest function',
  required: true,
  content: {
    'application/json': {schema: ProjectNewsSchemaPatch},
  },
};

export const ProjectNewsRequest = {
  description: 'The input of create ProjectNewsRequest function',
  required: true,
  content: {
    'application/json': {schema: ProjectNewsSchema},
  },
};
