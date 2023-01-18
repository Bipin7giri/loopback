import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {Transaction, UserInvestment} from '../models';
import {UserInvestmentRepository} from '../repositories';

export class UserInvestmentTransactionController {
  constructor(
    @repository(UserInvestmentRepository)
    protected userInvestmentRepository: UserInvestmentRepository,
  ) {}

  @get('/user-investments/{id}/transactions', {
    responses: {
      '200': {
        description: 'Array of UserInvestment has many Transaction',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Transaction)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Transaction>,
  ): Promise<Transaction[]> {
    return this.userInvestmentRepository.transactions(id).find(filter);
  }

  @post('/user-investments/{id}/transactions', {
    responses: {
      '200': {
        description: 'UserInvestment model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transaction)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof UserInvestment.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {
            title: 'NewTransactionInUserInvestment',
            exclude: ['id'],
            optional: ['userInvestmentId'],
          }),
        },
      },
    })
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    return this.userInvestmentRepository.transactions(id).create(transaction);
  }

  @patch('/user-investments/{id}/transactions', {
    responses: {
      '200': {
        description: 'UserInvestment.Transaction PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {partial: true}),
        },
      },
    })
    transaction: Partial<Transaction>,
    @param.query.object('where', getWhereSchemaFor(Transaction))
    where?: Where<Transaction>,
  ): Promise<Count> {
    return this.userInvestmentRepository
      .transactions(id)
      .patch(transaction, where);
  }

  @del('/user-investments/{id}/transactions', {
    responses: {
      '200': {
        description: 'UserInvestment.Transaction DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Transaction))
    where?: Where<Transaction>,
  ): Promise<Count> {
    return this.userInvestmentRepository.transactions(id).delete(where);
  }
}
