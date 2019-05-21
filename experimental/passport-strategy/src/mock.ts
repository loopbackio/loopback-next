// CANNOT import from the published repository, have to use relative path
// This should be fixed when the module graduates
// import {AuthenticationStrategy} from '@loopback/authentication';
import {AuthenticationStrategy, UserProfile} from '@loopback/authentication';
import {Request} from '@loopback/rest';

/**
 * This is a mock passport adapter implementation.
 * Created for exploring how to add the experimental feature.
 * See story https://github.com/strongloop/loopback-next/issues/2676
 */
export class MockPassportAdapter implements AuthenticationStrategy{ 
  name: 'mock-passport-adapter';
  authenticate(request: Request): Promise<UserProfile | undefined> {
    return Promise.resolve(undefined);
  };
}
