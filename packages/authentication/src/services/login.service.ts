import {Credentials} from '../types';
import {Request} from '@loopback/rest';

/**
 * A service that provide login operations.
 *
 * Discussion:
 * 1. should we turn the following 2 functions into standalone interfaces
 *    so that each service itself could be an extension point
 * 2. should we use a generic type for Credentials instead of hardcode it?
 */
export interface LoginService<U> {
  /**
   * Extract credentials like `username` and `password` from incoming request
   * Discussion:
   * 1. should we move extractors into a separate extractor service?
   * 2. should controller execute extractCredentials or auth action does it?
   *    Or it's on user's choice?
   * 3. should we specify `Request` from the rest module as the request type?
   * @param request The incoming HTTP request
   */
  extractCredentials(request: Request): Promise<Credentials>;
  /**
   * Verify the credential maps to a valid user and return the user if found
   * @param credentials the credentials returned by method `extractCredentials`
   */
  verifyCredentials(credentials: Credentials): Promise<U>;
}
