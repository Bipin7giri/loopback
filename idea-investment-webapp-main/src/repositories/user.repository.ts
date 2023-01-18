import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  Address,
  Media,

  Role,
  User,
  UserCredentials,

  UserRelations,
  UserRoles,
} from '../models';
import {AddressRepository} from './address.repository';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {MediaRepository} from './media.repository';
import {RoleRepository} from './role.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserRolesRepository} from './user-roles.repository';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultBaseEntityCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof User.prototype.id
  >;

  public readonly roles: HasManyThroughRepositoryFactory<
    Role,
    typeof Role.prototype.id,
    UserRoles,
    typeof User.prototype.id
  >;

  public readonly address: HasOneRepositoryFactory<
    Address,
    typeof User.prototype.id
  >;

  public readonly profilePicture: BelongsToAccessor<
    Media,
    typeof User.prototype.id
  >;


  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
    @repository.getter('UserRolesRepository')
    protected userRolesRepositoryGetter: Getter<UserRolesRepository>,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('AddressRepository')
    protected addressRepositoryGetter: Getter<AddressRepository>,
    @repository.getter('MediaRepository')
    protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(User, dataSource);

    this.profilePicture = this.createBelongsToAccessorFor(
      'profilePicture',
      mediaRepositoryGetter,
    );
    this.registerInclusionResolver(
      'profilePicture',
      this.profilePicture.inclusionResolver,
    );
    this.address = this.createHasOneRepositoryFactoryFor(
      'address',
      addressRepositoryGetter,
    );
    this.registerInclusionResolver('address', this.address.inclusionResolver);
    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      'roles',
      roleRepositoryGetter,
      userRolesRepositoryGetter,
    );
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);

    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err: any) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
