import { UserProfile } from '@loopback/authentication';
import { Request } from '@loopback/rest';
import { AuthenticateOptions, Strategy } from 'passport';
/**
 * Test fixture for a mock asynchronous passport-strategy
 */
export declare class MockPassportStrategy extends Strategy {
    private mockUser;
    name: string;
    setMockUser(userObj: UserProfile): void;
    /**
     * authenticate() function similar to passport-strategy packages
     * @param req
     */
    authenticate(req: Request, options?: AuthenticateOptions): Promise<void>;
    /**
     * @param req
     * mock verification function; usually passed in as constructor argument for
     * passport-strategy
     *
     * For the purpose of mock tests we have this here
     * pass req.query.testState = 'fail' to mock failed authorization
     * pass req.query.testState = 'error' to mock unexpected error
     */
    verify(request: Request): Promise<void>;
    returnMockUser(): void;
    returnUnauthorized(challenge?: string | number, status?: number): void;
    returnError(err: string): void;
}
