import { belongsTo, model, property } from '@loopback/repository';
import { BaseEntity } from './base-entity.model';
import { Project } from './project.model';
import { User } from './user.model';

@model({name: 'wishlists'})
export class Wishlist extends BaseEntity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => User, {keyFrom: 'userId'}, {name: 'user_id'})
  userId: number;

  @belongsTo(() => Project, {keyFrom: 'projectId'}, {name: 'project_id'})
  projectId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Wishlist>) {
    super(data);
  }
}

export interface WishlistRelations {
  // describe navigational properties here
}

export type WishlistWithRelations = Wishlist & WishlistRelations;
