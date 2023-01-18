import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  InclusionFilter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
// import {authenticate} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import Stripe from 'stripe';
import {ORDERSTATUS, PAYMENTMETHOD} from '../enums';
import {ordersFilter} from '../helpers/filters';
import {Order} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {
  OrderRepository,
  ProjectRepository,
  TransactionRepository,
} from '../repositories';
import {SUCCESS_RESPONSE} from '../types';
import {ORDER_UPDATE_PAYLOAD} from '../types/order.type';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {OrderRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Order;

@authenticate('jwt')
export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
  ) {}

  /**
   * User hits this route while investing on a project
   * @param order contains order data to be posted
   * @param currentUserProfile detects current user_id
   * @returns either success message or throws failure error
   */
  @post('/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Order model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: ['*']})
  async create(
    @requestBody(OrderRequest)
    order: Omit<Order, 'id'>,
    // transaction: TRANSACTION_PAYLOAD,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Order | SUCCESS_RESPONSE | any> {
    //checking project details where user is about invest
    const projectExists = await this.projectRepository.findById(
      order.projectId,
    );
    // calculating total investment in a project
    const totalInvestmetnBeforeInvest = await this.orderRepository.execute(
      `SELECT SUM(amount) as "totalInvestment" FROM orders WHERE project_id=${projectExists.id} AND status='${ORDERSTATUS.completed}';`,
    );

    const totalInvestment =
      parseInt(
        totalInvestmetnBeforeInvest &&
          totalInvestmetnBeforeInvest[0].totalInvestment,
      ) || 0;

    console.log(totalInvestment);

    // checking the invesment limit.
    if (totalInvestment >= projectExists.targetInvest) {
      throw new HttpErrors.BadRequest('Investment already occupied!');
    } else if (totalInvestment + order.amount > projectExists.targetInvest) {
      throw new HttpErrors.BadRequest(
        `Remaining eligible fund is ${projectExists.currency}:${
          projectExists.targetInvest - totalInvestment
        }`,
      );
    }
    try {
      const {amount, currency, referenceId, ...transactions} = order;
      // creating the investment/order
      const newOrder = await this.orderRepository.create({
        amount,
        currency,
        referenceId,
        orderById: currentUserProfile.id,
        projectId: projectExists.id,
      });
      // placing the tranastion
      if (newOrder) {
        const transactionEntity = await this.transactionRepository.create({
          requestedAmount: newOrder.amount,
          referenceId: newOrder.referenceId,
          paymentMethod: PAYMENTMETHOD.stripe,
          currency: newOrder.currency,
          transactionById: currentUserProfile.id,
          orderId: newOrder.id,
        });
        console.log(transactionEntity);

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

        // stripe verification
        try {
          // create customer details for future purpose
          const customer = await stripe.customers.create({
            name: transactions.name,
            email: transactions.email,
            source: transactions.tokenId,
          });
          // charge the specified amount
          const charge = await stripe.charges.create({
            customer: customer.id,
            currency: newOrder.currency,
            amount: newOrder.amount * 100,
          });
          // update tranaction records
          await this.transactionRepository.updateById(transactionEntity.id, {
            paymentDate: new Date(),
            paymentResponse: charge,
            paidAmount: newOrder.amount,
            orderId: newOrder.id,
            transactionId: charge.id,
          });
          // update order status if tranaction is completed
          await this.orderRepository.updateById(newOrder.id, {
            status: ORDERSTATUS.completed,
          });

          return {
            success: {
              statusCode: 200,
              message: 'Payment Success',
            },
          };
        } catch (error) {
          await this.transactionRepository.updateById(transactionEntity.id, {
            paymentResponse: error,
          });
          throw new HttpErrors.BadRequest(error);
        }
      }
    } catch (error: any) {
      throw new HttpErrors.BadRequest(
        (error.message.code = 'amount_too_small'
          ? 'Invalid tokenId'
          : 'Payment failed!'),
      );
    }
  }

  /**
   *
   * @param where acts as conditional expression
   * @returns total number of orders matched by conditional expression
   */
  @get('/admin/orders/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Order model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  /**
   *
   * @param filter filters the order/investment data
   * @returns all filtered order/investment data
   */
  @get('/admin/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    let include: InclusionFilter[] = ordersFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    return this.orderRepository.find({
      ...filter,
      where: {...filter?.where},
      include,
    });
  }

  /**
   *
   * @param currentUserProfile detects current user_id
   * @param where acts as conditional expression
   * @returns number of all order data matched by conditional expression
   */
  @get('/orders/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Order model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  // authorizing users to see total number of their orders
  @authorize({permissions: [PermissionKey.ViewOwnOrder]})
  async countOrders(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.where(Order) where?: Where<Order>,
  ): Promise<Count> {
    where = {orderById: currentUserProfile.id};
    return this.orderRepository.count(where);
  }

  /**
   *
   * @param currentUserProfile detects current user_id
   * @param filter filters order data
   * @returns filtered order data
   */
  @get('/orders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Order model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Order),
            },
          },
        },
      },
    },
  })
  // authorizing users to see all of their orders
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findOrders(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[] | any> {
    let include: InclusionFilter[] = ordersFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    return await this.orderRepository.find({
      ...filter,
      where: {...filter?.where, orderById: currentUserProfile.id},
      include,
    });
  }

  /**
   *
   * @param id
   * @param filter filters order data
   * @returns all firtered order data
   */
  @get('/admin/orders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Order model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<Order | any> {
    // return this.orderRepository.findById(id, filter);

    let include: InclusionFilter[] = ordersFilter;
    if (filter?.include) include = [...include, ...filter?.include];
    return await this.orderRepository.findById(id, {
      ...filter,
      where: {...filter},
      include,
    });
  }

  /**
   *
   * @param id represents order to be updated
   * @param order constains order status payload
   */
  @patch('/admin/orders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Order PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateOrder]})
  async updateById(
    @param.path.number('id') id: number,
    // @requestBody(OrderRequest)
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            exclude: [
              'id',
              'userId',
              'createdOn',
              'modifiedOn',
              'deleted',
              'deletedBy',
              'deletedOn',
              'deletedBy',
              'amount',
              'currency',
              'referenceId',
              'orderById',
              'projectId',
            ],
            partial: true,
          }),
        },
      },
    })
    order: ORDER_UPDATE_PAYLOAD,
  ): Promise<void> {
    await this.orderRepository.updateById(id, order);
  }

  // @put('/admin/orders/{id}', {
  //   security: OPERATION_SECURITY_SPEC,
  //   responses: {
  //     '204': {
  //       description: 'Order PUT success',
  //     },
  //   },
  // })
  // @authorize({permissions: [PermissionKey.UpdateOrder]})
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody(OrderRequest) order: Order,
  // ): Promise<void> {
  //   await this.orderRepository.replaceById(id, order);
  // }

  @del('/admin/orders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Order DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteOrder]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }

  /**
   *
   * @returns total investors this year
   */
  // @authenticate('jwt')
  @get('/total-investor/year', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findInvestorsPerYear(): Promise<any> {
    const countUniqueInvestorsByYear = await this.orderRepository.execute(
      `SELECT COUNT(DISTINCT orders.order_by_id) FROM orders WHERE created_on >= date_trunc('year', CURRENT_DATE)`,
    );

    return countUniqueInvestorsByYear[0];
  }

  /**
   *
   * @returns total investors this month
   */
  @get('/total-investor/month', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findInvestorsPerMonth(): Promise<any> {
    const countUniqueInvestorsByMonth = await this.orderRepository.execute(
      `SELECT COUNT(DISTINCT orders.order_by_id) FROM orders WHERE created_on >= date_trunc('month', CURRENT_DATE)`,
    );

    return countUniqueInvestorsByMonth[0];
  }

  /**
   *
   * @returns total investors today
   */
  @get('/total-investor/day', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findInvestorsPerDay(): Promise<any> {
    const countUniqueInvestorsPerDay = await this.orderRepository.execute(
      `SELECT COUNT(DISTINCT orders.order_by_id) FROM orders WHERE created_on >= date_trunc('day', CURRENT_DATE)`,
    );

    return countUniqueInvestorsPerDay[0];
  }

  /**
   *
   * @returns total investment countrywise
   */
  @get('/total-investment/countrywise', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findTotalInvestmentPerCountry(): Promise<any> {
    const totalInvestmentPerYear = await this.orderRepository.execute(
      `SELECT a.country, SUM(o.amount) as total_amount
        FROM orders o
        JOIN users u ON o.order_by_id = u.id
        JOIN addresses a ON u.id = a.user_id
        GROUP BY a.country`,
    );

    return totalInvestmentPerYear;
  }

  /**
   *
   * @returns total investment this year
   */
  @get('/total-investment/year', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findTotalInvestmentPerYear(): Promise<any> {
    const totalInvestmentPerYear = await this.orderRepository.execute(
      `SELECT SUM(amount) FROM orders WHERE created_on >= date_trunc('year', CURRENT_DATE)`,
    );
    return totalInvestmentPerYear;
  }

  /**
   *
   * @returns total investment this month
   */
  @get('/total-investment/month', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findTotalInvestmentPerMonth(): Promise<any> {
    const totalInvestmentPerMonth = await this.orderRepository.execute(
      `SELECT SUM(amount) FROM orders WHERE created_on >= date_trunc('month', CURRENT_DATE)`,
    );

    return totalInvestmentPerMonth;
  }

  /**
   *
   * @returns total investment today
   */
  @get('/total-investment/day', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async totalInvestmentPerDay(): Promise<any> {
    const totalInvestmentPerDay = await this.orderRepository.execute(
      `SELECT SUM(amount) FROM orders WHERE created_on >= date_trunc('day', CURRENT_DATE)`,
    );
    return totalInvestmentPerDay;
  }

  /**
   *
   * @returns total daily investment of current month
   */
  @get('/investment/daily', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findDailyTotalInvestment(): Promise<any> {
    // total investor by day
    const totalDailyInvestment = await this.orderRepository.execute(
      `SELECT EXTRACT(DAY FROM date_trunc('day', created_on)) as day, COALESCE(SUM(amount), 0)  as total_orders
      FROM orders
      WHERE created_on >= date_trunc('month', CURRENT_DATE)
      GROUP BY day
      ORDER BY day ASC;`,
    );
    return totalDailyInvestment;
  }

  /**
   *
   * @returns total monthly investment of current year
   */
  @get('/investment/monthly', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Order)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOrder]})
  async findMonthlyTotalInvestment(): Promise<any> {
    // total investor by day
    const totalMonthlyInvestment = await this.orderRepository.execute(
      `SELECT EXTRACT(MONTH FROM date_trunc('month', created_on)) as month, COALESCE(SUM(amount), 0) as total_orders
      FROM orders
      WHERE created_on >= date_trunc('year', CURRENT_DATE)
      GROUP BY month
      ORDER BY month ASC;`,
    );
    return totalMonthlyInvestment;
  }

  /**
   *
   * @returns total daily investment of speficf month
   */
  // @get('/investment/daily/dynamic', {
  //   security: OPERATION_SECURITY_SPEC,
  //   responses: {
  //     200: {
  //       describe: 'Media model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(Order)}},
  //     },
  //   },
  // })
  // @authorize({permissions: [PermissionKey.ViewOrder]})
  // async findMonthlyTotalInvestmentDynamic(): Promise<any> {
  //   const date = '2021-11-01';
  //   console.log(date);

  //   // total investor by day
  //   const totalInvestmentPerDay = await this.orderRepository.execute(

  //     `SELECT  date_trunc('month', created_on) as day, COALESCE(SUM(amount), 0) as total_orders
  //     FROM orders
  //     WHERE created_on >= date_trunc('month', TIMESTAMP '${date} AND created_on < date_trunc('month', TIMESTAMP '${date}') + interval '1 month'
  //     -- WHERE created_on >= date_trunc('month', CURRENT_DATE)
  //     GROUP BY day
  //     ORDER BY day ASC;`,
  //   );
  //   return totalInvestmentPerDay;
  // }
}
