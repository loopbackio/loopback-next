import {UserProfile, Credentials, AuthenticatedUser} from '../types';
import {Entity} from '@loopback/repository';
export interface AuthenticationServices {
  authenticateUser<U extends Entity>(
    credentials: Credentials,
  ): Promise<AuthenticatedUser<U>>;
  comparePassword<T = string>(credentialPass: T, userPass: T): Promise<boolean>;
  generateAccessToken(user: UserProfile): Promise<string>;
  decodeAccessToken(token: string): Promise<UserProfile | undefined>;
}
