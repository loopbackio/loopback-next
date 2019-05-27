import { Request } from '@loopback/rest';
import { Strategy } from 'passport';
import { AuthenticationStrategy, UserProfile } from '@loopback/authentication';
/**
 * Adapter class to invoke passport-strategy
 *   1. provides express dependencies to the passport strategies
 *   2. provides shimming of requests for passport authentication
 *   3. provides lifecycle similar to express to the passport-strategy
 *   3. provides state methods to the strategy instance
 * see: https://github.com/jaredhanson/passport
 */
export declare class StrategyAdapter implements AuthenticationStrategy {
    private readonly strategy;
    readonly name: string;
    passportStrategy: Strategy;
    /**
     * @param strategy instance of a class which implements a passport-strategy;
     * @description http://passportjs.org/
     */
    constructor(strategy: Strategy, name: string);
    /**
     * The function to invoke the contained passport strategy.
     *     1. Create an instance of the strategy
     *     2. add success and failure state handlers
     *     3. authenticate using the strategy
     * @param request The incoming request.
     */
    authenticate(request: Request): Promise<UserProfile>;
}
