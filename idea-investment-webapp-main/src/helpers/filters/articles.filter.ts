import {InclusionFilter} from '@loopback/repository';
import {mediaFields} from '../fields';
export const articleFilter: InclusionFilter[] = [
  {
    relation: 'coverImage',
    scope: {
      fields: mediaFields
    },
  },
  {
    relation: 'author',
    scope: {
      fields: ['id', 'fullName']
    },
  }

]
