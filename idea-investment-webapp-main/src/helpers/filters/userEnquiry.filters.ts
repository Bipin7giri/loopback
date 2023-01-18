import {InclusionFilter} from '@loopback/repository';

export const userEnquiryFilter: InclusionFilter[] = [
  {
    relation: 'user',
    scope: {
      fields: ['id', 'fullName']
    },
  },
  {
    relation: 'project',
    scope: {
      fields: ['id', 'name']
    },
  }
];
