import {InclusionFilter} from '@loopback/repository';
export const userFilters: InclusionFilter[] = [
  {
    relation: 'profilePicture',
  },
  {
    relation: 'address',
  },
  {
    relation: 'order',
    scope: {
      include: [
        {
          relation: 'transaction',
        },
        {
          relation: 'project',
        },
      ],
    },
  },
];
