import {authenticate} from '@loopback/authentication';
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
import {Company} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {CompanyRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {CompanyRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Company;

@authenticate('jwt')
export class CompanyController {
  constructor(
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
  ) {}

  @post('/admin/companies', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Company model instance',
        content: {'application/json': {schema: getModelSchemaRef(Company)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateCompany]})
  create(
    @requestBody(CompanyRequest)
    company: Omit<Company, 'id'>,
  ): Promise<Company> {
    return this.companyRepository.create({
      ...company,
      slug: slug(company.name),
    });
  }

  @get('/admin/companies/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Company model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewCompany]})
  count(@param.where(Company) where?: Where<Company>): Promise<Count> {
    return this.companyRepository.count(where);
  }

  @get('/admin/companies', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Company model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Company),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewCompany]})
  find(@param.filter(Company) filter?: Filter<Company>): Promise<Company[]> {
    return this.companyRepository.find(filter);
  }

  @patch('/admin/companies', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Company PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCompany]})
  updateAll(
    @requestBody(CompanyRequest)
    company: Company,
    @param.where(Company) where?: Where<Company>,
  ): Promise<Count> {
    return this.companyRepository.updateAll(
      {...company, slug: slug(company.name)},
      where,
    );
  }

  @get('/admin/companies/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Company model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Company),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewCompany]})
  findById(
    @param.path.number('id') id: number,
    @param.filter(Company, {exclude: 'where'})
    filter?: FilterExcludingWhere<Company>,
  ): Promise<Company> {
    return this.companyRepository.findById(id, filter);
  }

  @patch('/admin/companies/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Company PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCompany]})
  updateById(
    @param.path.number('id') id: number,
    @requestBody(CompanyRequest)
    company: Company,
  ): Promise<void> {
    return this.companyRepository.updateById(id, {
      ...company,
      slug: slug(company.name),
    });
  }

  @put('/admin/companies/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Company PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateCompany]})
  replaceById(
    @param.path.number('id') id: number,
    @requestBody(CompanyRequest) company: Company,
  ): Promise<void> {
    return this.companyRepository.replaceById(id, {
      ...company,
      slug: slug(company.name),
    });
  }

  @del('/admin/companies/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Company DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteCompany]})
  deleteById(@param.path.number('id') id: number): Promise<void> {
    return this.companyRepository.deleteById(id);
  }
}
