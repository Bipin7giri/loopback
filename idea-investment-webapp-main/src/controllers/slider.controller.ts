import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
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
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import slug from 'slug';
import {Slider} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {SliderRepository} from '../repositories';
import {SliderRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Slider;

export class SliderController {
  constructor(
    @repository(SliderRepository)
    public sliderRepository: SliderRepository,
  ) {}

  @authenticate('jwt')
  @post('/admin/sliders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Slider model instance',
        content: {'application/json': {schema: getModelSchemaRef(Slider)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateSlider]})
  async create(
    @requestBody(SliderRequest)
    slider: Omit<Slider, 'id'>,
  ): Promise<Slider> {
    if (slider.name) {
      slider.slug = slug(slider.name);
    }
    return this.sliderRepository.create(slider);
  }

  @authenticate('jwt')
  @get('/admin/sliders/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Slider model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewSlider]})
  async count(@param.where(Slider) where?: Where<Slider>): Promise<Count> {
    return this.sliderRepository.count(where);
  }

  @authenticate('jwt')
  @get('/admin/sliders', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Slider model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Slider),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewSlider]})
  async find(@param.filter(Slider) filter?: Filter<Slider>): Promise<Slider[]> {
    return this.sliderRepository.find(filter);
  }

  @get('/sliders', {
    responses: {
      '200': {
        description: 'Array of Slider model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Slider),
            },
          },
        },
      },
    },
  })
  async findActive(
    @param.filter(Slider) filter?: Filter<Slider>,
  ): Promise<Slider[]> {
    filter = {
      ...filter,
      where: {...filter?.where, isActive: true},
      order: ['priority ASC'],
      fields: [...new Set(['id', 'name', 'slug', 'image', 'imageId'])],
      include: [
        {
          relation: 'image',
          scope: {
            fields: ['id', 'path'],
          },
        },
      ],
    };
    return this.sliderRepository.find(filter);
  }

  // @authenticate('jwt')
  // @patch('/admin/sliders', {
  //   security: OPERATION_SECURITY_SPEC,
  //   responses: {
  //     '200': {
  //       description: 'Slider PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // @authorize({permissions: [PermissionKey.UpdateSlider]})
  // async updateAll(
  //   @requestBody(SliderRequest)
  //   slider: Slider,
  //   @param.where(Slider) where?: Where<Slider>,
  // ): Promise<Count> {
  //   return this.sliderRepository.updateAll(slider, where);
  // }

  @authenticate('jwt')
  @get('/admin/sliders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Slider model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Slider),
          },
        },
      },
    },
  })
  // @authorize({permissions: [PermissionKey.ViewSlider]})
  @authorize({permissions: ['*']})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Slider, {exclude: 'where'})
    filter?: FilterExcludingWhere<Slider>,
  ): Promise<Slider> {
    return this.sliderRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/admin/sliders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Slider PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateSlider]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(SliderRequest)
    slider: Slider,
  ): Promise<void> {
    if (slider?.name) {
      slider.slug = slug(slider?.name);
    }
    return this.sliderRepository.updateById(id, slider);
  }

  @authenticate('jwt')
  @put('/admin/sliders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Slider PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateSlider]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody(SliderRequest) slider: Slider,
  ): Promise<void> {
    if (slider.name) {
      slider.slug = slug(slider.name);
    }
    await this.sliderRepository.replaceById(id, slider);
  }

  @authenticate('jwt')
  @del('/admin/sliders/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Slider DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteSlider]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.sliderRepository.deleteById(id);
  }
}
