import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  InclusionFilter,
  Where,
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {partnersFilter} from '../helpers/filters/partner.filters';
import {Partner} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {PartnerRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
const PermissionKey: any = PermissionKeyResource.Parnters
export class PartnerControllerController {
  constructor(
    @repository(PartnerRepository)
    public partnerRepository: PartnerRepository,
  ) { }

  @authenticate('jwt')
  @post('/partners')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Partner model instance',
    content: {
      'application/json':
        {schema: getModelSchemaRef(Partner)}
    },
  })
  @authorize({permissions: [PermissionKey.CreatePartners]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partner, {
            title: 'NewPartner',
            exclude: ['id', 'deleted', 'deletedOn', 'deletedBy', 'createdOn', 'modifiedOn'],
          }),
        },
      },
    })
    partner: Omit<Partner, 'id'>,
  ): Promise<Partner> {
    return this.partnerRepository.create(partner);
  }

  @get('/partners/count')
  @response(200, {
    description: 'Partner model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Partner) where?: Where<Partner>,
  ): Promise<Count> {
    return this.partnerRepository.count(where);
  }

  @get('/partners')
  @response(200, {
    description: 'Array of Partner model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Partner, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Partner) filter?: Filter<Partner>,
  ): Promise<Partner[]> {
    // let include: InclusionFilter[] = partnersFilter;
    // if (filter?.include) include = [...include, ...filter?.include]

    // return this.partnerRepository.find({
    //   ...filter,
    //   where: {...filter?.where, where: {isActive: true}},
    //   include

    // });
    return this.partnerRepository.find(filter);
  }
  @authenticate('jwt')
  @patch('/partners')
  @response(200, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Partner PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authorize({permissions: [PermissionKey.UpdatePartners]})

  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partner, {partial: true}),
        },
      },
    })
    partner: Partner,
    @param.where(Partner) where?: Where<Partner>,
  ): Promise<Count> {
    return this.partnerRepository.updateAll(partner, where);
  }

  @get('/partners/{id}')
  @response(200, {
    description: 'Partner model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Partner, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Partner, {exclude: 'where'}) filter?: FilterExcludingWhere<Partner>
  ): Promise<Partner> {
    let include: InclusionFilter[] = partnersFilter;
    if (filter?.include) include = [...include, ...filter?.include]
    return this.partnerRepository.findById(id, {
      ...filter,
      include
    });
  }

  @authenticate('jwt')
  @patch('/partners/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Partner PATCH success',
  })
  @authorize({permissions: [PermissionKey.UpdatePartners]})

  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Partner, {
            exclude: ['id', 'deleted', 'deletedOn', 'deletedBy', 'createdOn', 'modifiedOn'],
            partial: true
          }),
        },
      },
    })
    partner: Partner,
  ): Promise<void> {
    await this.partnerRepository.updateById(id, partner);
  }

  @authenticate('jwt')
  @put('/partners/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Partner PUT success',
  })
  @authorize({permissions: [PermissionKey.UpdatePartners]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() partner: Partner,
  ): Promise<void> {
    await this.partnerRepository.replaceById(id, partner);
  }

  @authenticate('jwt')
  @del('/partners/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'Partner DELETE success',
  })
  @authorize({permissions: [PermissionKey.UpdatePartners]})
  async deleteById(@param.path.number('id') id: number): Promise<Boolean> {
    await this.partnerRepository.updateById(id, {deleted: true});
    return true
  }
}
