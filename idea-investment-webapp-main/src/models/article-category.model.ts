import {belongsTo, model, property} from '@loopback/repository';
import {Article} from './article.model';
import {BaseEntity} from './base-entity.model';
import {Category} from './category.model';

@model({name: 'article_categories'})
export class ArticleCategory extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Category, {keyFrom: 'categoryId'}, {keyTo: 'category_id'})
  categoryId: number;

  @belongsTo(() => Article, {keyFrom: 'articleId'}, {keyTo: 'article_id'})
  articleId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ArticleCategory>) {
    super(data);
  }
}

export interface ArticleCategoryRelations {
  // describe navigational properties here
}

export type ArticleCategoryWithRelations = ArticleCategory & ArticleCategoryRelations;
