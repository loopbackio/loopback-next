import {TokenService} from '@loopback/authentication';
import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {repository} from '@loopback/repository/';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {
  RefreshTokenInterceptorBindings,
  UserServiceBindings,
  TokenServiceBindings,
} from '../keys';
import {MyUserService} from '../services';
import {RefreshTokenRepository} from '../repositories';

const jwt = require('jsonwebtoken');
const verifyAsync = promisify(jwt.verify);
/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
export class RefreshTokenGrantInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(RefreshTokenInterceptorBindings.REFRESH_SECRET)
    private refreshSecret: string,
    @inject(UserServiceBindings.USER_SERVICE) public userService: MyUserService,
    @repository(RefreshTokenRepository)
    public refreshTokenRepository: RefreshTokenRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: TokenService,
  ) {}
  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      let result = await next();
      // Add post-invocation logic here
      const refreshToken = invocationCtx.args[0].refreshToken;

      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'refresh token' is null`,
        );
      }

      await verifyAsync(refreshToken, this.refreshSecret);
      const userRefreshData = await this.refreshTokenRepository.findOne({
        where: {refreshToken: refreshToken},
      });

      if (!userRefreshData) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : Invalid Token`,
        );
      }
      const user = await this.userService.findUserById(
        userRefreshData.userId.toString(),
      );
      const userProfile: UserProfile = this.userService.convertToUserProfile(
        user,
      );
      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);
      result = {
        accessToken: token,
      };
      return result;
    } catch (error) {
      // Add error handling logic here
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
