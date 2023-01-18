import {Count, DataObject, Entity, Where} from '@loopback/repository';
import {Options} from 'loopback-datasource-juggler';
import {SoftCrudRepository} from 'loopback4-soft-delete';
import {DbDataSource} from '../datasources';
import {BaseEntity} from '../models/base-entity.model';

export abstract class DefaultBaseEntityCrudRepository<
  T extends BaseEntity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: DbDataSource,
  ) {
    super(entityClass, dataSource);
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    entity.createdOn = new Date();
    entity.modifiedOn = new Date();
    return super.create(entity, options);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    entities.forEach(entity => {
      entity.createdOn = new Date();
      entity.modifiedOn = new Date();
    });
    return super.createAll(entities, options);
  }

  async save(entity: T, options?: Options): Promise<T> {
    entity.modifiedOn = new Date();
    return super.save(entity, options);
  }

  async update(entity: T, options?: Options): Promise<void> {
    entity.modifiedOn = new Date();
    return super.update(entity, options);
  }

  async updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    data.modifiedOn = new Date();
    return super.updateAll(data, where, options);
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    data.modifiedOn = new Date();
    return super.updateById(id, data, options);
  }

  async replaceById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    data.modifiedOn = new Date();
    return super.replaceById(id, data, options);
  }
}
