import {InclusionFilter} from '@loopback/repository';
import {mediaFields, projectInvestment} from '../fields';

export const projectsFilter: InclusionFilter[] = [
  {
    relation: 'images',
    scope: {
      fields: mediaFields,
    },
  },
  {
    relation: 'coverImage',
    scope: {
      fields: mediaFields,
    },
  },
  {
    relation: 'logo',
    scope: {
      fields: mediaFields,
    },
  },
  {relation: 'newsId'},
];

export const projectSingleFilter: InclusionFilter[] = [
  {
    relation: 'images',
    scope: {
      fields: mediaFields,
    },
  },
  {
    relation: 'coverImage',
    scope: {
      fields: mediaFields,
    },
  },
  {
    relation: 'logo',
    scope: {
      fields: mediaFields,
    },
  },
  {
    relation: 'investments',
    scope: {
      fields: projectInvestment,
    },
  },
  {relation: 'newsId'},
];
