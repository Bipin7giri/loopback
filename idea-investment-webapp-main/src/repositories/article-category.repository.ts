import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ArticleCategory, ArticleCategoryRelations, Category, Article} from '../models';
import {CategoryRepository} from './category.repository';
import {ArticleRepository} from './article.repository';

export class ArticleCategoryRepository extends DefaultCrudRepository<
  ArticleCategory,
  typeof ArticleCategory.prototype.id,
  ArticleCategoryRelations
> {

  public readonly category: BelongsToAccessor<Category, typeof ArticleCategory.prototype.id>;

  public readonly article: BelongsToAccessor<Article, typeof ArticleCategory.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('ArticleRepository') protected articleRepositoryGetter: Getter<ArticleRepository>,
  ) {
    super(ArticleCategory, dataSource);
    this.article = this.createBelongsToAccessorFor('article', articleRepositoryGetter,);
    this.registerInclusionResolver('article', this.article.inclusionResolver);
    this.category = this.createBelongsToAccessorFor('category', categoryRepositoryGetter,);
    this.registerInclusionResolver('category', this.category.inclusionResolver);
  }
}
