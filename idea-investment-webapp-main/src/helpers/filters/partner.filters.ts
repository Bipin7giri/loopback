import {InclusionFilter} from '@loopback/repository';
import {mediaFields} from '../fields';

export const partnersFilter: InclusionFilter[] = [
  {
    relation: 'media',
    scope: {
      fields: mediaFields,
    },
  },
];
