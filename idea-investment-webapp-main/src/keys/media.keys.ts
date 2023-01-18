import {BindingKey} from '@loopback/context';
import {MediaHandler} from '../types';

export const FILE_UPLOAD_SERVICE = BindingKey.create<MediaHandler>(
  'services.file-upload',
);

export const STORAGE_DRIVER = BindingKey.create<string>('storage.driver');
