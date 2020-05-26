import {
  Getter,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  uuid,
  ValueOrPromise,
} from '@loopback/context';
import {repository} from '@loopback/repository';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {RefreshTokenRepository} from '../repositories';
import {RefreshTokenInterceptorBindings} from '../keys';
import {HttpErrors} from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
export class RefreshTokenGenerateInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(RefreshTokenInterceptorBindings.REFRESH_SECRET)
    private refreshSecret: string,
    @inject(RefreshTokenInterceptorBindings.REFRESH_EXPIRES_IN)
    private refreshExpiresIn: string,
    @inject(RefreshTokenInterceptorBindings.REFRESH_ISSURE)
    private refreshIssure: string,
    @repository(RefreshTokenRepository)
    public refreshTokenRepository: RefreshTokenRepository,
    @inject.getter(SecurityBindings.USER, {optional: true})
    private getCurrentUser: Getter<UserProfile>,
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
      const currentUser = await this.getCurrentUser();
      const data = {
        token: uuid(),
      };
      const refreshToken = await signAsync(data, this.refreshSecret, {
        expiresIn: Number(this.refreshExpiresIn),
        issuer: this.refreshIssure,
      });
      result = Object.assign(result, {
        refreshToken: refreshToken,
      });
      await this.refreshTokenRepository.create({
        userId: currentUser.id,
        refreshToken: result.refreshToken,
      });
      return result;
    } catch (error) {
      // Add error handling logic here
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
