import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {
  Article,
  ArticleCategory,
  ArticleRelations,
  Category,
  Media,
  User,
} from '../models';
import {ArticleCategoryRepository} from './article-category.repository';
import {CategoryRepository} from './category.repository';
import {MediaRepository} from './media.repository';
import {UserRepository} from './user.repository';

export class ArticleRepository extends DefaultCrudRepository<
  Article,
  typeof Article.prototype.id,
  ArticleRelations
> {
  public readonly coverImage: BelongsToAccessor<
    Media,
    typeof Article.prototype.id
  >;

  public readonly author: BelongsToAccessor<User, typeof Article.prototype.id>;

  public readonly categories: HasManyThroughRepositoryFactory<
    Category,
    typeof Category.prototype.id,
    ArticleCategory,
    typeof Article.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('MediaRepository')
    protected mediaRepositoryGetter: Getter<MediaRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('ArticleCategoryRepository')
    protected articleCategoryRepositoryGetter: Getter<ArticleCategoryRepository>,
    @repository.getter('CategoryRepository')
    protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Article, dataSource);
    this.categories = this.createHasManyThroughRepositoryFactoryFor(
      'categories',
      categoryRepositoryGetter,
      articleCategoryRepositoryGetter,
    );
    this.registerInclusionResolver(
      'categories',
      this.categories.inclusionResolver,
    );
    this.author = this.createBelongsToAccessorFor(
      'author',
      userRepositoryGetter,
    );
    this.registerInclusionResolver('author', this.author.inclusionResolver);
    this.coverImage = this.createBelongsToAccessorFor(
      'coverImage',
      mediaRepositoryGetter,
    );
    this.registerInclusionResolver(
      'coverImage',
      this.coverImage.inclusionResolver,
    );
  }
}
