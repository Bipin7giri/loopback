import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {User} from '../models';
import {Credentials} from '../repositories';

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}
