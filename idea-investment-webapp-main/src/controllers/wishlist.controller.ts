import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {authorize} from 'loopback4-authorization';
import {Wishlist} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {WishlistRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {WishlistRequest} from './specs';

const PermissionKey: any = PermissionKeyResource.Wishlist;

@authenticate('jwt')
export class WishlistController {
  constructor(
    @repository(WishlistRepository)
    public wishlistRepository: WishlistRepository,
  ) {}

  @post('/wishlists', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Wishlist model instance',
        content: {'application/json': {schema: getModelSchemaRef(Wishlist)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateWishlist]})
  async create(
    @requestBody(WishlistRequest) wishlist: Omit<Wishlist, 'id'>,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Wishlist> {
    const wishlistEntity = await this.wishlistRepository.findOne({
      where: {projectId: wishlist.projectId, userId: currentUserProfile.id},
    });
    if (wishlistEntity) {
      return wishlistEntity;
    } else {
      return this.wishlistRepository.create({
        ...wishlist,
        userId: currentUserProfile.id,
      });
    }
  }

  @get('/wishlists', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Wishlist model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Wishlist),
            },
          },
        },
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewWishlist]})
  async find(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.filter(Wishlist) filter?: Filter<Wishlist>,
  ): Promise<Wishlist[]> {
    filter = {
      ...filter,
      where: {...filter?.where, userId: currentUserProfile.id},
    };
    return this.wishlistRepository.find(filter);
  }

  @del('/wishlists/{project_id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Wishlist DELETE success',
      },
    },
  })
  @authorize({permissions: [PermissionKey.DeleteWishlist]})
  async deleteById(
    @param.path.number('project_id') projectId: number,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<void> {
    const wishlistExists = await this.wishlistRepository.findOne({
      where: {projectId: projectId, userId: currentUserProfile.id},
    });
    if (wishlistExists)
      return this.wishlistRepository.deleteById(wishlistExists?.id);
  }
}
