# Spike for More Flexible UserProfile

connect to story https://github.com/strongloop/loopback-next/issues/2246

I picked the `authentication-passport` module to start the spike for more
flexible user profile because compared with the custom authentication
strategies, users have less control to the returned user when using the passport
adapter. I believe if we could find a solution for the passport based
strategies, applying similar approach to a custom strategy would be easy.

# Solution

A converter function is introduced to be passed into the `StrategyAdapter`'s
constructor. It takes in a custom user, converts it to a user profile described
by `UserProfile` then returns it.

# Example

See the corresponding change made in file
'authentication-with-passport-strategy-adapter.acceptance.ts':

- Type `UserProfileInDB` is defined to describe the custom user. In a real
  application it should be a custom User model.
- Define a factory function `userProfileFactory` that turns an `UserProfileInDB`
  instance into a user profile. It's provided in the constructor when creating
  the adapter.
- The converter is invoked in the strategy's `authentication()` function to make
  sure it returns a user profile in type `UserProfile`
- If the strategy is returned in a provider, you can inject the factory.

# Token Based Authentication

I created a test case called "test user profile factory" to apply the user
profile factory in a token based authentication. Here is the scenario:

- The app has a user model called `MyUser`, which has

  - a property defined in `UserProfile` with same type
  - a property defined in `UserProfile` with a different type
  - a required property not defined in `UserProfile`
  - an optional property not defined in `UserProfile`

- There is a user profile factory called `MyUserProfileFactory` which:

  - picks a minimum set of identity properties from the found user
  - converts a found user to a user profile. ((Those 4 properties in `MyUser`
    should cover all the possibilities in the conversion)

- The factory function is injected in `MyUserController`:

  - Added a new key in `AuthenticationBindings` called `USER_PROFILE_FACTORY`
    that can be used in injection.

- When a user logs in, the controller function `login` calls the factory
  function to generate corresponding user profile, and uses it as the payload to
  generate the token.

- Requests with the token in header will have the correct user profile injected
  in the controller functions.

# Follow-up Stories

## Story 1

- Add interface `UserProfileFactory` and key `USER_PROFILE_FACTORY` in
  `@loopback/authentication` to help developers inject the factory wherever it's
  needed.
- Add `userProfileFactory` in `StrategyAdapter`'s constructor.
- Tests
- Document

## Story 2

A user profile related refactor in `@loopback/authorization`: the
`authorizeInterceptor` should use `TypedPrincipal` instead of `Principal` in the
authorization context. And we should provide a default factory that converts a
user profile to a typed principal in `@loopback/security`. See PR
https://github.com/strongloop/loopback-next/pull/3807
