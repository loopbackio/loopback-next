import {Response} from '@loopback/rest';
import {Model} from '@loopback/repository';

/**
 * A service that provide access token operations.
 */
export interface TokenService<U extends Model> {
  /**
   * Generate the access token for a given user
   * Consumed by login action
   * @param user
   * @param options
   */
  generateAccessToken(user: U, options: Object): Promise<string>;
  /**
   * Write the token to HTTP response
   * Consumed by login action
   * @param response The HTTP response to return
   */
  serializeAccessToken(response: Response): Promise<void>;
  /**
   * Discussion:
   * 1. should we move extractors into a separate extractor service?
   * Extract the access token from request, it could be from header or cookie
   * @param request The incoming HTTP request
   */
  extractAccessToken(request: Request): Promise<string>;
}
