import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Partner, PartnerRelations, Media} from '../models';
import {MediaRepository} from './media.repository';

export class PartnerRepository extends DefaultCrudRepository<
  Partner,
  typeof Partner.prototype.id,
  PartnerRelations
> {

  public readonly media: BelongsToAccessor<Media, typeof Partner.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Partner, dataSource);
    this.media = this.createBelongsToAccessorFor('media', mediaRepositoryGetter,);
    this.registerInclusionResolver('media', this.media.inclusionResolver);
  }
}
