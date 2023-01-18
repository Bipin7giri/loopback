import {AuthenticationBindings, authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  InclusionFilter,
  Where,
  repository
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import _ from 'lodash';
import {authorize} from 'loopback4-authorization';
import slug from 'slug';
import {articleFilter} from '../helpers/filters/articles.filter';
import {Article} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {ArticleRepository} from '../repositories';
import {ArticleRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Article;

export class ArticleController {
  constructor(
    @repository(ArticleRepository)
    public articleRepository: ArticleRepository,
  ) { }

  @authenticate('jwt')
  @post('/admin/articles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article model instance',
        content: {'application/json': {schema: getModelSchemaRef(Article)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateArticle]})
  async create(
    @requestBody(ArticleRequest)
    article: Omit<Article, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Article> {
    let categories;
    if (article.title) {
      article.slug = slug(article.title);
    }

    if (article.categories) {
      categories = article.categories;
      delete article.categories;
    }

    const newArticle = await this.articleRepository.create(
      _.omit({...article, authorId: currentUserProfile.id}, 'categories'),
    );

    await categories.map((item: number) =>
      this.articleRepository.categories(newArticle.id).link(item),
    );

    return newArticle;
  }

  @authenticate('jwt')
  @get('/admin/articles/count', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateArticle]})
  async count(@param.where(Article) where?: Where<Article>): Promise<Count> {
    return this.articleRepository.count(where);
  }

  @authenticate('jwt')
  @get('/admin/articles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Article model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Article),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewArticle]})
  async find(
    @param.filter(Article) filter?: Filter<Article>,
  ): Promise<Article[]> {
    let include: InclusionFilter[] = articleFilter;
    if (filter?.include) include = [...include, ...filter?.include]
    // filter = {
    //   ...filter,
    //   where: {...filter?.where, publishDate: {lte: new Date()}},
    // };
    return await this.articleRepository.find({
      ...filter,
      where: {...filter?.where, },
      include
    });
  }

  @authenticate('jwt')
  @patch('/admin/articles', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateArticle]})
  async updateAll(
    @requestBody(ArticleRequest)
    article: Article,
    @param.where(Article) where?: Where<Article>,
  ): Promise<Count> {
    return this.articleRepository.updateAll(article, where);
  }

  @authenticate('jwt')
  @get('/admin/articles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Article model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Article),
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewArticle]})
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Article, {exclude: 'where'})
    filter?: FilterExcludingWhere<Article>,
  ): Promise<Article> {
    let include: InclusionFilter[] = articleFilter;
    if (filter?.include) include = [...include, ...filter?.include]
    return this.articleRepository.findById(id, {
      ...filter,
      include,
    });
  }

  @authenticate('jwt')
  @patch('/admin/articles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Article PATCH success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateArticle]})
  async updateById(
    @param.path.number('id') id: number,
    @requestBody(ArticleRequest)
    article: Omit<Article, 'id'>,
  ): Promise<void> {
    let categories;
    if (article.title) {
      article.slug = slug(article.title);
    }
    if (article.categories) {
      categories = article.categories;
      delete article.categories;
    }
    await this.articleRepository.updateById(id, _.omit(article, 'categories'));

    if (categories) {
      const categoriesExists = await this.articleRepository
        .categories(id)
        .find();
      if (categoriesExists && categoriesExists.length > 0)
        await this.articleRepository.categories(id).unlinkAll();
      await categories.map((item: number) =>
        this.articleRepository.categories(id).link(item),
      );
    }
  }

  @authenticate('jwt')
  @put('/admin/articles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Article PUT success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.UpdateArticle]})
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody(ArticleRequest) article: Omit<Article, 'id'>,
  ): Promise<void> {
    let categories;
    if (article.title) {
      article.slug = slug(article.title);
    }
    if (article.categories) {
      categories = article.categories;
      delete article.categories;
    }
    await this.articleRepository.updateById(id, _.omit(article, 'categories'));

    if (categories) {
      const categoriesExists = await this.articleRepository
        .categories(id)
        .find();
      if (categoriesExists && categoriesExists.length > 0)
        await this.articleRepository.categories(id).unlinkAll();
      await categories.map((item: number) =>
        this.articleRepository.categories(id).link(item),
      );
    }
  }

  @authenticate('jwt')
  @del('/admin/articles/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Article DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteArticle]})
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.articleRepository.deleteById(id);
  }

  @get('/articles/count', {
    responses: {
      '200': {
        description: 'Article model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async countArticles(
    @param.where(Article) where?: Where<Article>,
  ): Promise<Count> {
    where = {publishDate: {gt: new Date()}};
    return this.articleRepository.count(where);
  }

  @get('/articles', {
    responses: {
      '200': {
        description: 'Array of Article model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Article),
            },
          },
        },
      },
    },
  })
  async findArticles(
    @param.filter(Article) filter?: Filter<Article>,
  ): Promise<Article[]> {
    let include: InclusionFilter[] = articleFilter;
    if (filter?.include) include = [...include, ...filter?.include]
    // filter = {
    //   ...filter,
    //   where: {...filter?.where, publishDate: {lte: new Date()}},
    // };
    return await this.articleRepository.find({
      ...filter,
      where: {...filter?.where, },
      include
    });
  }

  @get('/articles/{id}', {
    responses: {
      '200': {
        description: 'Article model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Article),
          },
        },
      },
    },
  })
  async findArticlesById(
    @param.path.number('id') id: number,
    @param.filter(Article, {exclude: 'where'})
    filter?: FilterExcludingWhere<Article>,
  ): Promise<Article> {
    await this.articleRepository.categories(id);
    return await this.articleRepository.findById(id, filter);
  }
}
