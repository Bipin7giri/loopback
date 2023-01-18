// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserRepository,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {UserServiceBindings} from '../keys';
import {UserManagementService} from './user-management.service';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;
    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      const dbAccessToken = await this.userRepository.findById(decodedToken.id);
      if (token === dbAccessToken?.accessToken) {
        userProfile = Object.assign(
          {[securityId]: '', name: '', id: 0, roles: []},
          {
            [securityId]: decodedToken.id,
            name: decodedToken.name,
            id: decodedToken.id,
            roles: decodedToken.roles,
          },
        );
      } else if (dbAccessToken?.isLogin === false) {
        throw new HttpErrors.Unauthorized(
          `Session Expired!! Please Login again`,
        );
      } else {
        throw new HttpErrors.Unauthorized(
          `already logged in from other machine`,
        );
      }
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
    } catch (error: any) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<any> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    // Generate a JSON Web Token
    let access: string, refresh: string;
    try {
      access = await signAsync(
        {
          id: userProfile.id,
          name: userProfile.name,
          roles: userProfile.roles,
        },
        this.jwtSecret,
        {
          expiresIn: Number(this.jwtExpiresIn),
        },
      );
      const result = await this.userRepository.execute(
        `UPDATE users SET isLogin = 'true' WHERE id = '${userProfile?.id}'`,
      );
      refresh = await signAsync(
        {
          id: userProfile.id,
        },
        this.jwtSecret,
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    await this.userManagementService.updateUser(userProfile.id, {
      refreshToken: refresh,
    });

    return {access: {token: access}, refresh: {token: refresh}};
  }
  async revokeToken(token: string): Promise<boolean> {
    const getToken = await this.userRepository.execute(
      `SELECT * from users WHERE access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTYsInJvbGVzIjpbeyJpZCI6MiwibmFtZSI6IlVzZXIiLCJzbHVnIjoidXNlciJ9XSwiaWF0IjoxNjczMzQyNjg2LCJleHAiOjE2NzMzNjQyODZ9.OLKbjOrFwvR5zcUkEpZx7RhfKmEndKu16nv6ZM7KiaU'`,
    );
    const removeToken = await this.userRepository.execute(
      `UPDATE users SET access_token = 'null' WHERE access_token = '${token}'`,
    );
    return true;
  }
}
