import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Company, CompanyRelations, Media } from '../models';
import { DefaultBaseEntityCrudRepository } from './default-base-entity-crud.repository.base';
import { MediaRepository } from './media.repository';

export class CompanyRepository extends DefaultBaseEntityCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {

  public readonly coverImage: BelongsToAccessor<Media, typeof Company.prototype.id>;

  public readonly logo: BelongsToAccessor<Media, typeof Company.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Company, dataSource);
    this.logo = this.createBelongsToAccessorFor('logo', mediaRepositoryGetter,);
    this.registerInclusionResolver('logo', this.logo.inclusionResolver);
    this.coverImage = this.createBelongsToAccessorFor('coverImage', mediaRepositoryGetter,);
    this.registerInclusionResolver('coverImage', this.coverImage.inclusionResolver);
  }
}
