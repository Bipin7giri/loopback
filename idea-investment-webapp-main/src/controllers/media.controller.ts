import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import S3 from 'aws-sdk/clients/s3';
import {authorize} from 'loopback4-authorization';
import multer from 'multer';
import stream from 'stream';
import {Media} from '../models';
import {PermissionKeyResource} from '../permission-key.enum';
import {MediaRepository} from '../repositories';
import {OPERATION_SECURITY_SPEC} from '../utils';
const {Duplex} = stream;

function bufferToStream(buffer: any) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}

const config = {
  region: process.env.S3_REGION || undefined,
  accessKeyId: process.env.S3_ACCESSKEYID || undefined,
  secretAccessKey: process.env.S3_SECRETACCESSKEY || undefined,
  endpoint: process.env.S3_ENDPOINT || undefined,
};

const s3 = new S3(config);

const PermissionKey: any = PermissionKeyResource.Media;

/**
 * A controller to handle file uploads using multipart/form-data media type
 */

export class MediaController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */
  constructor(
    @repository(MediaRepository) public mediaRepository: MediaRepository,
  ) { }

  @authenticate('jwt')
  @get('/medias', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        describe: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Media)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.ViewMedia]})
  async findAll(): Promise<Array<Media>> {
    return await this.mediaRepository.find();
  }

  @authenticate('jwt')
  @post('/medias', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      200: {
        description: 'Media model instance',
        content: {'application/json': {schema: getModelSchemaRef(Media)}},
      },
    },
  })
  @authorize({permissions: [PermissionKey.CreateMedia]})
  async create(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUserProfile: UserProfile,
  ): Promise<Array<Media>> {
    return new Promise<Array<Media>>((resolve, reject) => {
      const storage = multer.memoryStorage();
      const upload = multer({storage});

      upload.any()(request, response, async (err: any) => {
        if (err) reject(err);
        else {
          let res = new Array();
          for (const file of (request as any).files) {
            const params = {
              Bucket: process.env.S3_BUCKET || 'ecommerce-supreme',
              Key: file.originalname, // File name you want to save as in S3
              Body: bufferToStream(file.buffer),
            };
            try {
              const stored = await s3.upload(params).promise();
              const media = await this.mediaRepository.create({
                filename: file.originalname,
                path: stored.Location,
                mimetype: file.mimetype,
                userId: currentUserProfile.id,
                size: file.size,
              });
              res.push(media);
            } catch (err: any) {
              reject(err);
            }
          }
          resolve(res);
        }
      });
    });
  }

  @get('/medias/{id}', {
    responses: {
      '200': {
        description: 'Media model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Media),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<any> {
    const mediaExists = await this.mediaRepository.findById(id);

    const Bucket = process.env.S3_BUCKET || 'ecommerce-supreme';
    const Key = mediaExists.filename;

    return s3.getObject({Bucket, Key}).createReadStream().pipe(response);
  }

  //   @delete('/medias/{id}', {
  //     response: {
  // '204': {
  //   description: 'Media model instance',
  // }
  //     }
  //   })
}
