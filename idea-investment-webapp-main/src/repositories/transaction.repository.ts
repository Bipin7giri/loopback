import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Order, Transaction, TransactionRelations} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {OrderRepository} from './order.repository';

export class TransactionRepository extends DefaultBaseEntityCrudRepository<
  Transaction,
  typeof Transaction.prototype.id,
  TransactionRelations
> {
  public readonly order: BelongsToAccessor<
    Order,
    typeof Transaction.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('OrderRepository')
    protected orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(Transaction, dataSource);
    this.order = this.createBelongsToAccessorFor(
      'order',
      orderRepositoryGetter,
    );
    this.registerInclusionResolver('order', this.order.inclusionResolver);
  }
}
