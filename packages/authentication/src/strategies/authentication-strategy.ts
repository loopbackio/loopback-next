import {Request} from '@loopback/rest';
import {Model} from '@loopback/repository';

/**
 * An interface describes a typical authentication strategy.
 *
 * An authentication strategy is usually a class with an
 * authenticate method that verifies a user's identity and
 * returns the corresponding user profile.
 */

export interface AuthStrategy<U extends Model> {
  verify(request: Request): Promise<U | undefined>;

  register(request: Request): Promise<U | undefined>;

  /**
   * Discussion:
   * 1. how do we decide what's the return data of login operation?
   *    it could be an access token, or a user, or something else.
   * @param request
   */
  login(request: Request): Promise<U | undefined>;
}
