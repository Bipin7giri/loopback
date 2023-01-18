// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {
  ApplicationConfig,
  BindingKey,
  createBindingFromClass,
} from '@loopback/core';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import fs from 'fs';
import {
  AuthorizationBindings,
  AuthorizationComponent,
} from 'loopback4-authorization';

import path from 'path';
import {
  HttpClientServiceBindings,
  PasswordHasherBindings,
  UserServiceBindings,
} from './keys';
import {ErrorHandlerMiddlewareProvider} from './middleware';
import {Role, UserWithPassword} from './models';
// import {FcmProvider} from './providers';
import {RoleRepository, UserRepository} from './repositories';
import {MySequence} from './sequence';
import {
  BcryptHasher,
  HttpClientService,
  JWTService,
  SecuritySpecEnhancer,
  UserManagementService,
} from './services';
import YAML = require('yaml');

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}

export const PackageKey = BindingKey.create<PackageInfo>('application.package');

const pkg: PackageInfo = require('../package.json');
const firebaseConfig = require('../firebase-config.json');

export class IdeaInvestmentNepalApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    dotenv.config();
    dotenvExt.load({
      schema: '.env',
      errorOnMissing: false,
    });
    super(options);

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer'],
    });
    this.component(AuthorizationComponent);

    this.component(RestExplorerComponent);

    // Firebase Cloud Message
    /** TODO:
     * Create the Notification Component
     * Create fcmBindings and Config
     * NotificationBindings.Push Provider
     * FcmProvider
     *
     */

    this.setUpBindings();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);

    // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(UserManagementService);
    this.bind(HttpClientServiceBindings.HTTP_CLIENT_SERVICE).toClass(
      HttpClientService,
    );
    this.add(createBindingFromClass(SecuritySpecEnhancer));

    this.add(createBindingFromClass(ErrorHandlerMiddlewareProvider));

    // Use JWT secret from JWT_SECRET environment variable if set
    // otherwise create a random string of 64 hex digits
    const secret =
      process.env.JWT_SECRET ?? crypto.randomBytes(32).toString('hex');
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(secret);
  }

  // Unfortunately, TypeScript does not allow overriding methods inherited
  // from mapped types. https://github.com/microsoft/TypeScript/issues/38496
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  async start(): Promise<void> {
    // Use `databaseSeeding` flag to control if products/users should be pre
    // populated into the database. Its value is default to `true`.
    if (this.options.databaseSeeding !== false) {
      await this.migrateSchema();
    }
    return super.start();
  }

  async migrateSchema(options?: SchemaMigrationOptions): Promise<void> {
    await super.migrateSchema(options);

    // Pre-populate roles
    const roleRepo = await this.getRepository(RoleRepository);
    // await userRepo.deleteAll();
    const rolesDir = path.join(__dirname, '../fixtures/roles');
    const rolesFiles = fs.readdirSync(rolesDir);

    for (const file of rolesFiles) {
      if (file.endsWith('.yml')) {
        const roleFile = path.join(rolesDir, file);
        const yamlString = YAML.parse(fs.readFileSync(roleFile, 'utf8'));
        const role = new Role(yamlString);
        const userManagementService = await this.get<UserManagementService>(
          UserServiceBindings.USER_SERVICE,
        );
        let roleExists = await userManagementService.getRoleBySlug(
          yamlString.slug,
        );
        if (!roleExists) {
          await userManagementService.createRole(role);
        }
      }
    }

    // Pre-populate users
    const userRepo = await this.getRepository(UserRepository);
    // await userRepo.deleteAll();
    const usersDir = path.join(__dirname, '../fixtures/users');
    const userFiles = fs.readdirSync(usersDir);

    for (const file of userFiles) {
      if (file.endsWith('.yml')) {
        const userFile = path.join(usersDir, file);
        const yamlString = YAML.parse(fs.readFileSync(userFile, 'utf8'));
        const roleName = yamlString.roles;
        delete yamlString.roles;
        const userWithPassword = new UserWithPassword(yamlString);
        const userManagementService = await this.get<UserManagementService>(
          UserServiceBindings.USER_SERVICE,
        );
        // userWithPassword.roleId = (await userManagementService.getRoleBySlug(roleName))?.id
        const userExists = await userRepo.findOne({
          where: {email: yamlString.email},
        });
        const roleExists = await userManagementService.getRoleBySlug(
          yamlString.roles,
        );
        if (roleExists) {
          userWithPassword.roles = [roleExists];
        }
        if (!userExists) {
          await userManagementService.createUser(userWithPassword);
        }
      }
    }
  }
}
