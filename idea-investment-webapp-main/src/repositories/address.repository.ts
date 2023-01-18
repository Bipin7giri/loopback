import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Address, AddressRelations, User} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {UserRepository} from './user.repository';

export class AddressRepository extends DefaultBaseEntityCrudRepository<
  Address,
  typeof Address.prototype.id,
  AddressRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Address.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Address, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
