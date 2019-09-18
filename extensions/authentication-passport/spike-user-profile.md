# Spike for More Flexible UserProfile

connect to story https://github.com/strongloop/loopback-next/issues/2246

I picked the `authentication-passport` module to start the spike for more flexible user profile because compared with the custom authentication strategies, users have less control to the returned user when using the passport adapter. I believe if we could find a solution for the passport based strategies, applying similar approach to a custom strategy would be easy.

# Solution

A converter function is introduced to be passed into the `StrategyAdapter`'s constructor. It takes in a custom user, converts it to a user profile described by `UserProfile` then returns it.

# Example

See the corresponding change made in file 'authentication-with-passport-strategy-adapter.acceptance.ts':

- Type `UserProfileInDB` is defined to describe the custom user. In a real application it should be a custom User model.
- Define a converter function `converter` that turns an `UserProfileInDb` instance into a user profile. It's provided in the constructor when create the adapter.
- The converter is invoked in the strategy's `authentication()` function to make sure it returns a user profile in type `UserProfile`
- If the strategy is returned in a provider, you can inject the converter.

# To Be Done

Add a field `additionalProperties` in type `AnyObject` in the `UserProfile` interface to allow people add additional fields as the minimum set of identification info. 