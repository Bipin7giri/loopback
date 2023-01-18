import {SchemaObject} from '@loopback/rest';
import {CURRENCY_LABEL, CURRENCY_TYPE} from '../../enums';

const projectSchema = (require: string[]): SchemaObject => {
  return {
    type: 'object',
    // required: [
    //   'name',
    //   'description',
    //   'expiredDate',
    //   'targetInvest',
    //   'highestInvest',
    //   'currency',
    //   'currencyLabel',
    // ],
    required: require,
    properties: {
      name: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      expiredDate: {
        type: 'string',
        format: 'date',
      },
      targetInvest: {
        type: 'number',
      },
      highestInvest: {
        type: 'number',
      },
      currency: {
        type: 'string',
        enum: [CURRENCY_TYPE.usd, CURRENCY_TYPE.npr],
      },
      currencyLabel: {
        type: 'string',
        enum: [CURRENCY_LABEL.dollar, CURRENCY_LABEL.rupee],
      },
      idea: {
        type: 'string',
      },
      companyId: {
        type: 'number',
        minimum: 1,
      },
      isActive: {
        type: 'boolean',
        default: false,
      },
      coverImageId: {
        type: 'number',
      },
      logoId: {
        type: 'number',
      },
      imageId: {
        type: 'array',
      },
      content: {
        type: 'string',
        minimum: 40,
      },
      list: {
        type: 'string',
      },
      reason_to_invest: {
        type: 'string',
      },
      project_synopsis: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      newsContent: {
        type: 'string',
      },
      authorId: {
        type: 'number',
      },
    },
  };
};

export const ProjectDetailSchema: SchemaObject = {
  type: 'object',
  required: ['projectId', 'content'],
  properties: {
    projectId: {
      type: 'number',
    },
    content: {
      type: 'string',
      minimum: 40,
    },
  },
};

const projectAndDetailSchema: SchemaObject = projectSchema([
  'projectId',
  'companyId',
  'content',
  'imageId',
]);

const projectAndDetailSchemaPatch: SchemaObject = projectSchema([]);

export const ProjectDetailRequest = {
  description: 'The input of create project detail function',
  required: true,
  content: {
    'application/json': {
      schema: projectAndDetailSchema,
    },
  },
};

export const ProjectAndDetailsRequestPatch = {
  description: 'The input of create project function',
  required: true,
  content: {
    'application/json': {schema: projectAndDetailSchemaPatch},
  },
};

export const ProjectAndDetailRequest = {
  description: 'The input of create project method',
  required: true,
  content: {
    'application/json': {schema: projectAndDetailSchema},
  },
};
