import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Order, OrderRelations, Project, Transaction, User} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {ProjectRepository} from './project.repository';
import {TransactionRepository} from './transaction.repository';
import {UserRepository} from './user.repository';

export class OrderRepository extends DefaultBaseEntityCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly orderBy: BelongsToAccessor<User, typeof Order.prototype.id>;

  public readonly project: BelongsToAccessor<
    Project,
    typeof Order.prototype.id
  >;

  public readonly transaction: HasOneRepositoryFactory<
    Transaction,
    typeof Order.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('ProjectRepository')
    protected projectRepositoryGetter: Getter<ProjectRepository>,
    @repository.getter('TransactionRepository')
    protected transactionRepositoryGetter: Getter<TransactionRepository>,
  ) {
    super(Order, dataSource);
    this.transaction = this.createHasOneRepositoryFactoryFor(
      'transaction',
      transactionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'transaction',
      this.transaction.inclusionResolver,
    );
    this.project = this.createBelongsToAccessorFor(
      'project',
      projectRepositoryGetter,
    );
    this.registerInclusionResolver('project', this.project.inclusionResolver);
    this.orderBy = this.createBelongsToAccessorFor(
      'orderBy',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('orderBy', this.orderBy.inclusionResolver);
  }
}
