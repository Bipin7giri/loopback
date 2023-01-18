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
import {Category} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {CategoryRepository} from '../repositories';
import {CategoryRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Category;

@authenticate('jwt')
export class CategoryController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  @post('/admin/categories', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Category model instance',
        content: {'application/json': {schema: getModelSchemaRef(Category)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateCategory]})
  async create(
    @requestBody(CategoryRequest)
    category: Omit<Category, 'id'>,
  ): Promise<Category> {
    if (category.name) {
      category.slug = slug(category.name);
    }
    return this.categoryRepository.create(category);
  }

  @get('/admin/categories/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Category model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(@param.where(Category) where?: Where<Category>): Promise<Count> {
    return this.categoryRepository.count(where);
  }

  @get('/admin/categories', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Category model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Category),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewCategory]})
  async find(
    @param.filter(Category) filter?: Filter<Category>,
  ): Promise<Category[]> {
    return this.categoryRepository.find(filter);
  }

  @patch('/admin/categories', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Category PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCategory]})
  async updateAll(
    @requestBody(CategoryRequest)
    category: Category,
    @param.where(Category) where?: Where<Category>,
  ): Promise<Count> {
    return this.categoryRepository.updateAll(category, where);
  }

  @get('/admin/categories/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Category model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Category),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewCategory]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Category, {exclude: 'where'})
    filter?: FilterExcludingWhere<Category>,
  ): Promise<Category> {
    return this.categoryRepository.findById(id, filter);
  }

  @patch('/admin/categories/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Category PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCategory]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(CategoryRequest)
    category: Category,
  ): Promise<void> {
    if (category.name) {
      category.slug = slug(category.name);
    }
    await this.categoryRepository.updateById(id, category);
  }

  @put('/admin/categories/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Category PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCategory]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody(CategoryRequest) category: Category,
  ): Promise<void> {
    if (category.name) {
      category.slug = slug(category.name);
    }
    await this.categoryRepository.replaceById(id, category);
  }

  @del('/admin/categories/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Category DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteCategory]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.categoryRepository.deleteById(id);
  }
}
