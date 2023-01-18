import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Notificationobject, NotificationobjectRelations, Notification} from '../models';
import {NotificationRepository} from './notification.repository';

export class NotificationobjectRepository extends DefaultCrudRepository<
  Notificationobject,
  typeof Notificationobject.prototype.id,
  NotificationobjectRelations
> {

  public readonly notification: BelongsToAccessor<Notification, typeof Notificationobject.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('NotificationRepository') protected notificationRepositoryGetter: Getter<NotificationRepository>,
  ) {
    super(Notificationobject, dataSource);
    this.notification = this.createBelongsToAccessorFor('notification', notificationRepositoryGetter,);
    this.registerInclusionResolver('notification', this.notification.inclusionResolver);
  }
}
