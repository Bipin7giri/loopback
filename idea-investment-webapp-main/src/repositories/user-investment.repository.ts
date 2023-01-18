import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserInvestment, UserInvestmentRelations, Transaction} from '../models';
import {TransactionRepository} from './transaction.repository';

export class UserInvestmentRepository extends DefaultCrudRepository<
  UserInvestment,
  typeof UserInvestment.prototype.id,
  UserInvestmentRelations
> {

  public readonly transactions: HasManyRepositoryFactory<Transaction, typeof UserInvestment.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('TransactionRepository') protected transactionRepositoryGetter: Getter<TransactionRepository>,
  ) {
    super(UserInvestment, dataSource);
    this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionRepositoryGetter,);
  }
}
