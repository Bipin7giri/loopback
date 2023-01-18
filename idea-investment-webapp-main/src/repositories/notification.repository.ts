import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Notification, NotificationRelations, Notificationobject} from '../models';
import {NotificationobjectRepository} from './notificationobject.repository';

export class NotificationRepository extends DefaultCrudRepository<
  Notification,
  typeof Notification.prototype.id,
  NotificationRelations
> {

  public readonly notificationobjects: HasManyRepositoryFactory<Notificationobject, typeof Notification.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('NotificationobjectRepository') protected notificationobjectRepositoryGetter: Getter<NotificationobjectRepository>,
  ) {
    super(Notification, dataSource);
    this.notificationobjects = this.createHasManyRepositoryFactoryFor('notificationobjects', notificationobjectRepositoryGetter,);
    this.registerInclusionResolver('notificationobjects', this.notificationobjects.inclusionResolver);
  }
}
