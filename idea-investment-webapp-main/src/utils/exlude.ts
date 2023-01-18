import {Fields} from '@loopback/repository';

export const softExclude: Fields<object> = {
  deleted: false,
  deletedOn: false,
  deletedBy: false,
  modifiedOn: false,
};
