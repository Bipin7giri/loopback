import {
  authenticate,
  AuthenticationBindings,
  TokenService,
  UserService,
} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserCredentialsRepository,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  CountSchema,
  FilterExcludingWhere,
  model,
  property,
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  Request,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import _ from 'lodash';
import {authorize} from 'loopback4-authorization';
import {ROLE, TOKEN_TYPE} from '../enums';
import {PasswordHasherBindings, UserServiceBindings} from '../keys';
import {User} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {Credentials, UserRepository} from '../repositories';
import {
  PasswordHasher,
  UserManagementService,
  validateCredentials,
} from '../services';
import {RESEND_VERIFICATION, RESET_PASSWORD, VERIFICATION} from '../types';
import {OPERATION_SECURITY_SPEC} from '../utils';
import {
  ForgotPasswordRequestBody,
  GoogleLoginRequest,
  LoginUserRequest,
  RegisterUserRequest,
  ReSendVerificationRequest,
  ResetPasswordRequestBody,
  UpdateUserRequest,
  VerificationRequest,
} from './specs';
const PermissionKey: any = PermissionKeyResource.User;
const FireBase: any = PermissionKeyResource.UserFirebase;
@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

export class UserManagementController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserCredentialsRepository)
    public userCredentialsRepository: UserCredentialsRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER, {optional: true})
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({permissions: [PermissionKey.ViewOwnUser]})
  async getCurrentUser(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User | null> {
    return this.userManagementService.getUser(currentUserProfile.id, filter);
  }

  @patch('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: CountSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({permissions: [PermissionKey.UpdateOwnUser]})
  async updateCurrentUser(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @requestBody(UpdateUserRequest) user: Omit<User, 'id'>,
  ): Promise<void> {
    return this.userManagementService.updateUser(currentUserProfile.id, user);
  }

  @post('/users/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  @authorize({permissions: ['*']})
  async register(
    @requestBody(RegisterUserRequest) user: NewUserRequest,
  ): Promise<User> {
    // All new users have the "user" role by default
    const role = await this.userManagementService.getRoleBySlug(ROLE.user);
    if (role?.id) {
      user.roles = [role];
    }

    // ensure a valid email value and password value
    validateCredentials(_.pick(user, ['email', 'password']));

    try {
      user.token = Math.floor(Math.random() * 900000) + 100000;
      user.tokenExpiredDate = new Date();
      user.tokenType = TOKEN_TYPE.verification;
      const res = await this.userManagementService.createUser(user);
      res.token = null;
      res.id = 0;
      return res;
    } catch (error: any) {
      // MongoError 11000 duplicate key
      if (error.code === 11000 && error.errmsg.includes('index: uniqueEmail')) {
        throw new HttpErrors.Conflict('Email value is already taken');
      } else {
        throw error;
      }
    }
  }

  @patch('/users/firebase/{id}')
  @response(204, {
    security: OPERATION_SECURITY_SPEC,
    description: 'userfirebase PATCH success',
  })
  @authenticate('jwt')
  @authorize({permissions: ['*']})
  async updateFireBase(
    @param.path.number('id') id: number,
    @requestBody() user: any,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<any> {
    const updateUserFirebase = this.userRepository.updateById(id, user);
    response.json({
      statusCode: 204,
      message: 'Sucessfully Updated user device id',
    });
    return response;
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(LoginUserRequest) credentials: Credentials,
  ): Promise<any> {
    const user = await this.userService.verifyCredentials(credentials);

    const isFirstLogin: boolean = !user.lastLogin;
    this.userManagementService.updateLastlogin(user.id, user);

    const {roles, id, fullName, email, phone}: any = user;
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const tokens: any = await this.jwtService.generateToken(userProfile);

    const userInfo: any = await this.userRepository.findOne({
      where: {email: credentials?.email},
    });

    const setAccessToken = await this.userRepository.execute(
      `UPDATE users SET access_token = '${tokens.access.token}' WHERE id = '${userInfo.id}'`,
    );
    return {
      user: {
        id,
        fullName,
        email,
        phone,
        isFirstLogin,
        roles,
      },
      tokens: tokens,
    };
  }

  @post('/users/verification', {
    responses: {
      '200': {
        description: 'User verification by OTP',
        content: {'application/json': {schema: {type: String}}},
      },
    },
  })
  verification(
    @requestBody(VerificationRequest) user: VERIFICATION,
  ): Promise<string> {
    return this.userManagementService.userVerification(user);
  }
  @authenticate('jwt')
  @get('/users/logout', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: {type: String}}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewOwnUser]})
  async logout(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
    @inject(RestBindings.Http.RESPONSE)
    response: Response,
  ): Promise<any> {
    const authToken: any =
      request?.headers?.authorization?.split(' ')[1] ?? false;
    const removeToken = async (token: string) => {
      const getToken = await this.userRepository.execute(
        `SELECT * from users WHERE access_token = '${token}'`,
      );
      const removeToken = await this.userRepository.execute(
        `UPDATE users SET access_token = 'null', isLogin = 'false' WHERE access_token = '${token}'`,
      );

      if (removeToken.affectedRows === 1) {
        return true;
      } else {
        throw new HttpErrors.Unauthorized(
          `Something went wrong! please try again later`,
        );
      }
    };
    const result = await removeToken(authToken);
    if (result === true) {
      response.json({
        message: 'successful logout',
      });
    }
  }

  @post('/users/re-send-verification', {
    responses: {
      '200': {
        description: 'User re-send verification OTP',
        content: {'application/json': {schema: {type: String}}},
      },
    },
  })
  resendVerification(
    @requestBody(ReSendVerificationRequest) user: RESEND_VERIFICATION,
  ): Promise<string> {
    return this.userManagementService.reSendVerification(user);
  }

  @post('/users/forgot-password', {
    responses: {
      '200': {
        description: 'Confirmation that reset password email has been sent',
        content: {'application/json': {schema: {type: String}}},
      },
    },
  })
  async forgotPassword(
    @requestBody(ForgotPasswordRequestBody) user: RESEND_VERIFICATION,
  ): Promise<string> {
    return this.userManagementService.forgotPassword(user);
  }

  @post('/users/reset-password', {
    responses: {
      '200': {
        description: 'A successful password reset response',
        content: {'application/json': {schema: {type: String}}},
      },
    },
  })
  async resetPassword(
    @requestBody(ResetPasswordRequestBody) user: RESET_PASSWORD,
  ): Promise<string> {
    return this.userManagementService.resetPassword(user);
  }

  @post('/users/google-login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async goolelogin(
    @requestBody(GoogleLoginRequest) {token}: {token: string},
  ): Promise<any> {
    const user = await this.userManagementService.googleLogin(token);

    const {id, fullName, email, phone, roles} = user;

    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const tokens = await this.jwtService.generateToken(userProfile);

    return {
      user: {
        id,
        fullName,
        email,
        phone,
        roles,
      },
      tokens: tokens,
    };
  }

  @get('/users/refresh-toekn/{refresh_token}', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async refreshToken(
    @param.path.string('refresh_token') refreshToken: string,
  ): Promise<any> {
    const user = await this.userManagementService.getUserByRefreshToken(
      refreshToken,
    );
    const {id, fullName, email, phone, roles}: any = user;

    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const tokens = await this.jwtService.generateToken(userProfile);

    return {
      user: {
        id,
        fullName,
        email,
        phone,
        roles,
      },
      tokens: tokens,
    };
  }

  // user delete api
  @del('/users/remove', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: CountSchema,
          },
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({permissions: [PermissionKey.ViewOwnUser]})
  async deleteUser(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<boolean> {
    await this.userRepository.updateById(currentUserProfile.id, {
      deleted: true,
    });
    //  return this.userManagementService.getUser(currentUserProfile.id, filter);
    return true;
  }
}
