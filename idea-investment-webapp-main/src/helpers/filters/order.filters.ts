import {InclusionFilter} from '@loopback/repository';
import {mediaFields, transationFields} from '../fields';
import {projectFields} from '../fields/project.fields';
import {userFields} from '../fields/user.fields';
export const ordersFilter: InclusionFilter[] = [
  {
    relation: 'transaction',
    scope: {
      fields: transationFields,
    },
  },
  {
    relation: 'orderBy',
    scope: {
      fields: userFields,
    },
  },
  {
    relation: 'project',
    scope: {
      fields: projectFields,
      include: [
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
      ],
    },
  },
];
