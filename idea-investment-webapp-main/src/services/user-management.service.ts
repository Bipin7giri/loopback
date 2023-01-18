// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {FilterExcludingWhere, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {HttpClientService} from '.';
import {ROLE, TOKEN_TYPE} from '../enums';
import {HttpClientServiceBindings, PasswordHasherBindings} from '../keys';
import {Role, RoleRelations, User, UserWithPassword} from '../models';
import {Credentials, RoleRepository, UserRepository} from '../repositories';
import {RESEND_VERIFICATION, RESET_PASSWORD, VERIFICATION} from '../types';
// import {EmailService} from './email.service';
import {PasswordHasher} from './hash.password.bcryptjs';

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    // @inject('services.EmailService')
    // public emailService: EmailService,
    @inject(HttpClientServiceBindings.HTTP_CLIENT_SERVICE)
    public httpClientService: HttpClientService,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const {email, password} = credentials;
    const invalidCredentialsError = 'Invalid email or password.';

    if (!email) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const foundUser = await this.userRepository.findOne({
      where: {email},
      include: ['roles'],
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    if (!foundUser.isEmailVerified) {
      throw new HttpErrors.Unauthorized(
        `Email is not verified. Please check inbox of email: ${email}.`,
      );
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.email,
      fullName: user.fullName,
      id: user.id,
      roles:
        user.roles &&
        user.roles.map((item: Role) => {
          return {id: item.id, name: item.name, slug: item.slug};
        }),
    };
  }

  async createUser(userWithPassword: UserWithPassword): Promise<User> {
    if (userWithPassword.email) {
      const emailExists = await this.userRepository.findOne({
        where: {email: userWithPassword.email},
      });
      if (emailExists) {
        throw new HttpErrors.Conflict('Email already exist');
      }
    }
    if (userWithPassword.phone) {
      const phoneExists = await this.userRepository.findOne({
        where: {phone: userWithPassword.phone},
      });
      if (phoneExists) {
        throw new HttpErrors.Conflict('Phone number already exist');
      }
    }
    const password = await this.passwordHasher.hashPassword(
      userWithPassword.password,
    );
    userWithPassword.password = password;
    const user = await this.userRepository.create(
      _.omit(userWithPassword, 'password', 'roles'),
    );
    await this.userRepository.userCredentials(user.id).create({password});
    await userWithPassword.roles.map((item: Role) =>
      this.userRepository.roles(user.id).link(item.id),
    );
    // this.emailService.sendVerificationTokenMail(user);
    return user;
  }

  async userVerification(user: VERIFICATION): Promise<string> {
    const userExists = await this.userRepository.findOne({
      where: {
        email: user.email,
        token: user.token,
        tokenType: TOKEN_TYPE.verification,
      },
    });
    if (!userExists) {
      throw new HttpErrors.NotFound('Invalid email or OTP token.');
    } else {
      await this.userRepository.updateById(userExists.id, {
        isEmailVerified: true,
        token: null,
        tokenExpiredDate: null,
        tokenType: null,
      });
      return 'Verification complete successfully';
    }
  }

  async reSendVerification(user: RESEND_VERIFICATION): Promise<string> {
    const userExists = await this.userRepository.findOne({
      where: {email: user.email},
    });
    if (!userExists) {
      throw new HttpErrors.NotFound(`Invalid email: ${user.email}`);
    } else if (userExists.isEmailVerified) {
      throw new HttpErrors.BadRequest(
        `This email: ${user.email} is already verified`,
      );
    }

    await this.userRepository.updateById(userExists.id, {
      token: Math.floor(Math.random() * 900000) + 100000,
      tokenExpiredDate: new Date(),
      tokenType: TOKEN_TYPE.verification,
    });

    // this.emailService.sendVerificationTokenMail(
    //   await this.userRepository.findById(userExists.id),
    // );

    return `Verification OPT is successfully send to your email: ${userExists.email}`;
  }

  async forgotPassword(user: RESEND_VERIFICATION): Promise<string> {
    const userExists = await this.userRepository.findOne({
      where: {email: user.email},
    });
    if (!userExists) {
      throw new HttpErrors.NotFound('Invalid email or OTP token.');
    }

    await this.userRepository.updateById(userExists.id, {
      token: Math.floor(Math.random() * 900000) + 100000,
      tokenExpiredDate: new Date(),
      tokenType: TOKEN_TYPE.resetPassword,
    });

    // this.emailService.sendResetPasswordMail(
    //   await this.userRepository.findById(userExists.id),
    // );

    return `Verification OPT is successfully send to your email: ${userExists.email}.`;
  }

  async resetPassword(user: RESET_PASSWORD): Promise<string> {
    const userExists = await this.userRepository.findOne({
      where: {
        email: user.email,
        token: user.token,
        tokenType: TOKEN_TYPE.resetPassword,
      },
    });
    if (!userExists) {
      throw new HttpErrors.NotFound('Invalid email or OTP token.');
    } else {
      await this.userRepository.updateById(userExists.id, {
        token: null,
        tokenExpiredDate: null,
        tokenType: null,
      });
      const password = await this.passwordHasher.hashPassword(user.password);
      await this.userRepository.updateById(
        userExists.id,
        _.omit(
          {
            token: null,
            tokenExpiredDate: null,
            tokenType: null,
            isEmailVerified: true,
          },
          'password',
        ),
      );
      await this.userRepository.userCredentials(userExists.id).delete();
      await this.userRepository
        .userCredentials(userExists.id)
        .create({password});
      return `Your password for this email: ${userExists.email} is successfully reset.`;
    }
  }

  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findById(id, {
      include: [{relation: 'roles'}],
    });

    // console.log(user, 'getUserById');

    // return await this.userRepository.findById(id, {include: ['roles']});

    // return user;
  }

  async getRoleBySlug(slug: string): Promise<(Role & RoleRelations) | null> {
    return this.roleRepository.findOne({where: {slug: slug}});
  }

  async getRoleById(
    roles: Array<Role>,
  ): Promise<(Role & RoleRelations) | null> {
    const id = (roles && roles[0].id) || 0;
    return this.roleRepository.findById(id);
  }

  async updateLastlogin(id: number, body: User): Promise<void> {
    const {roles, ...userBody} = body;

    return this.userRepository.updateById(id, {
      ...userBody,
      lastLogin: new Date(),
    });
  }

  async createRole(role: Role) {
    return this.roleRepository.create(role);
  }

  async googleLogin(token: string): Promise<User> {
    try {
      const googleUser: any = this.httpClientService.googleAuthenticate(token);
      const userExists = await this.userRepository.findOne({
        where: {email: googleUser.email},
      });
      if (userExists) {
        await this.userRepository.updateById(userExists.id, {
          googleId: googleUser.id,
          isEmailVerified: true,
        });

        return this.userRepository.findById(userExists.id, {
          include: ['roles'],
        });
      } else {
        const user = await this.userRepository.create(
          _.omit(
            {
              fullName: googleUser.name,
              email: googleUser.email,
              googleId: googleUser.id,
              isEmailVerified: true,
            },
            'roles',
          ),
        );
        const role = await this.getRoleBySlug(ROLE.user);
        if (role) await this.userRepository.roles(user.id).link(role.id);

        return this.userRepository.findById(user.id, {include: ['roles']});
      }
    } catch (error) {
      throw new HttpErrors.Unauthorized(error.message);
    }
  }

  async getUser(
    id: number,
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  async updateUser(id: number, user: any): Promise<void> {
    const updateUser = await this.userRepository.updateById(
      id,
      _.omit(user, 'roles', 'address'),
    );

    if (user.address) {
      await this.userRepository.address(id).delete();
      await this.userRepository.address(id).create(user.address);
    }
    return updateUser;
  }
  async deleteOwnUser(id: number, users?: any): Promise<any> {
    console.log(id)
    try {
      const deleteUser = await this.userRepository.deleteById(id);
      return true;
    }
    catch (err) {
      return err;
    }

  }

  async getUserByRefreshToken(refreshToken: string): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {refreshToken},
      include: ['roles'],
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized('Invalid refresh token');
    }

    if (!foundUser.isEmailVerified) {
      throw new HttpErrors.Unauthorized(
        `Email is not verified. Please check inbox of email: ${foundUser.email}.`,
      );
    }

    return foundUser;
  }

  // async appleLogin(token: string): Promise<User> {
  //     try {
  //         const appleUser: any = this.httpClientService.googleAuthenticate(token);
  //         const userExists = await this.userRepository.findOne({ where: { email: appleUser.email } });
  //         if (userExists) {
  //             await this.userRepository.updateById(userExists.id, { appleId: appleUser.id, isEmailVerified: true });

  //             return this.userRepository.findById(userExists.id, {include: ['roles']});;
  //         } else {
  //             const user = await this.userRepository.create(
  //                 _.omit({ fullName: appleUser.name, email: appleUser.email, googleId: appleUser.id, isEmailVerified: true }, 'roles'),
  //             );
  //             const role = await this.getRoleBySlug(ROLE.user);
  //             if (role) await this.userRepository.roles(user.id).link(role.id);

  //             return this.userRepository.findById(user.id, {include: ['roles']});;
  //         }
  //     } catch (error) {
  //         throw new HttpErrors.Unauthorized(error.message);
  //     }
  // }
}
