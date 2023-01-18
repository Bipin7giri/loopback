import {BindingKey} from '@loopback/context';

export namespace HttpClientServiceBindings {
  export const HTTP_CLIENT_SERVICE = BindingKey.create<any>(
    'http.client.service',
  );
}
