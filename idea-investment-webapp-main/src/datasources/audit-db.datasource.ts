import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {AuditDbSourceName} from '@sourceloop/audit-log';

const config = {
  name: 'auditDb',
  connector: 'postgresql'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AuditDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = AuditDbSourceName;
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.auditDb', {optional: true})
    dsConfig: object = config,
  ) {
    Object.assign(dsConfig, {
      name: 'db',
      connector: 'postgresql',
      url: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    super(dsConfig);
  }
}
