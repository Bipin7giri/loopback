import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Partner,
  Media,
} from '../models';
import {PartnerRepository} from '../repositories';

export class PartnerMediaController {
  constructor(
    @repository(PartnerRepository)
    public partnerRepository: PartnerRepository,
  ) { }

  @get('/partners/{id}/media', {
    responses: {
      '200': {
        description: 'Media belonging to Partner',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Media)},
          },
        },
      },
    },
  })
  async getMedia(
    @param.path.number('id') id: typeof Partner.prototype.id,
  ): Promise<Media> {
    return this.partnerRepository.media(id);
  }
}
