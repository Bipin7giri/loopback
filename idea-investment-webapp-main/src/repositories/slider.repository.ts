import {inject, Getter} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {Slider, SliderRelations, Media} from '../models';
import {DefaultBaseEntityCrudRepository} from './default-base-entity-crud.repository.base';
import {repository, BelongsToAccessor} from '@loopback/repository';
import {MediaRepository} from './media.repository';

export class SliderRepository extends DefaultBaseEntityCrudRepository<
  Slider,
  typeof Slider.prototype.id,
  SliderRelations
> {

  public readonly image: BelongsToAccessor<Media, typeof Slider.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('MediaRepository') protected mediaRepositoryGetter: Getter<MediaRepository>,
  ) {
    super(Slider, dataSource);
    this.image = this.createBelongsToAccessorFor('image', mediaRepositoryGetter,);
    this.registerInclusionResolver('image', this.image.inclusionResolver);
  }
}
