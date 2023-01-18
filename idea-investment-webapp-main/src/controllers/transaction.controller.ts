import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import Stripe from 'stripe';
import {ORDERSTATUS, PAYMENTMETHOD} from '../enums';
import {Transaction} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {OrderRepository, TransactionRepository} from '../repositories';
import {SUCCESS_RESPONSE, TRANSACTION_PAYLOAD} from '../types';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {TransactionRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Transaction;

@authenticate('jwt')
export class TransactionController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @post('/transactions/stripe', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transaction model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transaction)}},
      },
    },
  })
  // @authorize({permissions: ['*']})
  @authorize({permissions: PermissionKey.CreateTransaction})
  async stripe(
    @requestBody(TransactionRequest)
    transaction: TRANSACTION_PAYLOAD,
    @inject(AuthenticationBindings.CURRENT_USER) user: UserProfile,
  ): Promise<SUCCESS_RESPONSE> {
    const orderExists = await this.orderRepository.findOne({
      where: {referenceId: transaction.referenceId},
      include: ['transaction', 'project'],
    });

    if (!orderExists) throw new HttpErrors.NotFound('Invalid reference id');

    if (orderExists.transaction)
      throw new HttpErrors.BadRequest('Already paid');

    try {
      //try block here to be remove in production
      let transactionEntity = await this.transactionRepository.findOne({
        where: {referenceId: transaction.referenceId},
      });

      if (!transactionEntity) {
        transactionEntity = await this.transactionRepository.create({
          requestedAmount: orderExists.amount,
          referenceId: transaction.referenceId,
          paymentMethod: PAYMENTMETHOD.stripe,
          currency: orderExists.currency,
          transactionById: user.id,
        });
      }
      return {
        success: {
          statusCode: 200,
          message: 'Payment Success',
        },
      };
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }

    // console.log("fjkdddddddddddddd..........");

    // let secretKey: string;

    // if (process.env.NODE_ENV !== 'production')
    //   secretKey = process.env.LIVE_STRIPE_SECRET_KEY ?? '_sk_key';

    // secretKey = process.env.TEST_STRIPE_SECRET_KEY ?? '_sk_key';

    // const stripe = new Stripe(secretKey, {
    //   apiVersion: '2020-08-27',
    //   typescript: true,
    // });

    // try {
    //   const customer = await stripe.customers.create({
    //     name: transaction.name,
    //     email: transaction.email,
    //     // source: transaction.tokenId,
    //   });

    //   const charge = await stripe.charges.create({
    //     amount: orderExists.amount * 100,
    //     currency: orderExists.currency,
    //     description: orderExists.project.name,
    //     customer: customer.id,
    //   });

    //   await this.transactionRepository.updateById(transactionEntity.id, {
    //     paymentDate: new Date(),
    //     paymentResponse: charge,
    //     paidAmount: orderExists.amount,
    //     orderId: orderExists.id,
    //     transactionId: charge.id,
    //   });

    //   await this.orderRepository.updateById(orderExists.id, {
    //     status: ORDERSTATUS.completed,
    //   });

    //   return {
    //     success: {
    //       statusCode: 200,
    //       message: 'Payment Success',
    //     },
    //   };
    // } catch (error) {
    //   await this.transactionRepository.updateById(transactionEntity.id, {
    //     paymentResponse: error,
    //   });

    //   throw new HttpErrors.BadRequest(error.message);
    // }
  }

  @post('/transactions/stripe/subscription', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '201': {
        description: 'Transaction model instance',
        content: {'application/json': {schema: getModelSchemaRef(Transaction)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateTransaction]})
  async stripeSubscription(
    @requestBody(TransactionRequest)
    transaction: TRANSACTION_PAYLOAD,
    @inject(AuthenticationBindings.CURRENT_USER) user: UserProfile,
  ): Promise<void> {
    const orderExists = await this.orderRepository.findOne({
      where: {referenceId: transaction.referenceId},
      include: ['transaction', 'project'],
    });
    if (!orderExists) {
      throw new HttpErrors.NotFound('Invalid reference id');
    } else if (orderExists.transaction) {
      throw new HttpErrors.BadRequest('Already paid');
    }
    const transactionEntity = await this.transactionRepository.create({
      requestedAmount: orderExists.amount,
      referenceId: transaction.referenceId,
      paymentMethod: PAYMENTMETHOD.stripe,
      currency: orderExists.currency,
      transactionById: user.id,
    });
    let secretKey: string;
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test'
    ) {
      secretKey = process.env.TEST_STRIPE_SECRET_KEY ?? 'sk_test_';
    } else {
      secretKey = process.env.LIVE_STRIPE_SECRET_KEY ?? 'sk_live_';
    }
    const stripe = new Stripe(secretKey, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
    stripe.customers
      .create({
        name: transaction.name,
        email: transaction.email,
        // source: transaction.tokenId,
      })
      .then(customer =>
        stripe.subscriptions.create({
          customer: customer.id,
          items: [{plan: transaction.plan}],
          expand: ['latest_invoice.payment_intent'],
        }),
      )
      .then(async charge => {
        await this.transactionRepository.updateById(transactionEntity.id, {
          paymentDate: new Date(),
          paymentResponse: charge,
          paidAmount: orderExists.amount,
          orderId: orderExists.id,
          transactionId: charge.id,
        });
        await this.orderRepository.updateById(orderExists.id, {
          status: ORDERSTATUS.completed,
        });
        return 'Payment successfully.';
      })
      .catch(async error => {
        await this.transactionRepository.updateById(transactionEntity.id, {
          paymentResponse: error,
        });
        return 'Payment Failed!';
      });
  }

  @get('/transactions/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Transaction model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  // @authorize({permissions: [PermissionKey.ViewTransaction]})
  @authorize({permissions: ['*']})
  async count(
    @param.where(Transaction) where?: Where<Transaction>,
  ): Promise<Count> {
    return this.transactionRepository.count(where);
  }

  @get('/transactions', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Transaction model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Transaction),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: ['*']})
  // @authorize({permissions: [PermissionKey.ViewTransaction]})
  async find(
    @param.filter(Transaction) filter?: Filter<Transaction>,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find(filter);
  }
}
