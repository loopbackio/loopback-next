import {UserProfile} from '../types';

export interface TokenService {
  verifyToken(token: string): Promise<UserProfile>;
  generateToken(userProfile: UserProfile): Promise<string>;
}
