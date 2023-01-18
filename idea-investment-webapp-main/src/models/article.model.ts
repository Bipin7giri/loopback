import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {ARTICLE_TYPE} from '../enums';
import {ArticleCategory} from './article-category.model';
import {BaseEntity} from './base-entity.model';
import {Category} from './category.model';
import {Media} from './media.model';
import {User} from './user.model';

@model({name: 'articles'})
export class Article extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'title',
      dataType: 'varchar'
    }
  })
  title: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'slug',
      dataType: 'varchar'
    }
  })
  slug: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(ARTICLE_TYPE),
    },
    postgresql: {
      columnName: 'type',
      dataType: 'varchar'
    }
  })
  type?: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'date',
    required: true,
    name: 'publish_date'
  })
  publishDate: string;

  @belongsTo(() => Media)
  coverImageId: number;

  @belongsTo(() => User)
  authorId: number;

  @hasMany(() => Category, {through: {model: () => ArticleCategory, keyFrom: 'articleId', keyTo: 'categoryId'}})
  categories: Category[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Article>) {
    super(data);
  }
}

export interface ArticleRelations {
  // describe navigational properties here
}

export type ArticleWithRelations = Article & ArticleRelations;
