import {
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  ExpressRequestHandler,
  FindRoute,
  HttpErrors,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import cors from 'cors';
import helmet from 'helmet';
import {
  AuthorizationBindings,
  AuthorizeErrorKeys,
  AuthorizeFn,
  UserPermissionsFn,
} from 'loopback4-authorization';
import morgan from 'morgan';
import {ClientErrorMessage} from './enums';
import {UserServiceBindings} from './keys';
import {UserManagementService} from './services';

const SequenceActions = RestBindings.SequenceActions;

const middleWareList: ExpressRequestHandler[] = [
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
  morgan('dev', {}),
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
];

export class MySequence implements SequenceHandler {
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorization: AuthorizeFn,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    private readonly getUserPermissions: UserPermissionsFn<string>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
  ) {}

  async handle(context: RequestContext) {
    const requestTime = Date.now();
    try {
      const {request, response} = context;
      const finished = await this.invokeMiddleware(context, middleWareList);
      if (finished) return;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      request.body = args[args.length - 1];
      await this.authenticateRequest(request);
      const authUser = await this.authenticateRequest(request);
      if (authUser) {
        let permissions = authUser
          ? (await this.userManagementService.getUserById(authUser.id))
              ?.roles?.[0]?.permissions
          : [];
        if (!permissions) {
          permissions = [];
        }

        const isAccessAllowed: boolean = await this.checkAuthorization(
          permissions, // do authUser.permissions if using method #1
          request,
        );
        // Checking access to route here
        if (!isAccessAllowed) {
          throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
        }
      }
      const result = await this.invoke(route, args);

      if (result?.fail) throw new HttpErrors.NotFound(result?.fail?.message);
      if (!result && request.method === 'GET')
        throw new HttpErrors.NotFound(ClientErrorMessage.EntityNotFound);

      this.send(response, result);
    } catch (err) {
      if (
        err.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        err.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(err, {statusCode: 401 /* Unauthorized */});
      }
      // ---------- END OF SNIPPET -------------
      this.reject(context, err);
    }
  }
}
