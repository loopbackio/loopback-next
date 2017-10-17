# Feature: Context bindings - organizing services as extension point/extensions by naming convention

- In order to manage services that follow the extension point/extension pattern
- As a developer
- I would like to bind a extension point and its extensions to the context following certain conventions
- So that an extension point can find all of its extensions or one of them by name

See https://wiki.eclipse.org/FAQ_What_are_extensions_and_extension_points%3F for the pattern.

# Scenario - register an extension to a given extension point

- Given a context
- Given a class `AuthenticationManager` as the extension point for extensible authentication strategies
- Given a class `LocalStrategy` that implements the `local` authentication strategy
- Given a class `LDAPStrategy` that implements the `ldap` authentication strategy
- Given a class `OAuth2Strategy` that implements the `oauth2` authentication strategy
- We should be able to add `LocalStrategy` by binding it to `authentication.strategies.local`
- We should be able to add `LDAPStrategy` by binding it to `authentication.strategies.ldap`
- We should be able to add `OAuth2Strategy` by binding it to `authentication.strategies.oauth2`

# Scenario - find all of its extensions for a given extension point

- Given a context
- Given a class `AuthenticationManager` as the extension point for extensible authentication strategies
- Given a class `LocalStrategy` that implements the `local` authentication strategy
- Given a class `LDAPStrategy` that implements the `ldap` authentication strategy
- Given a class `OAuth2Strategy` that implements the `oauth2` authentication strategy
- When LocalStrategy is bound to `authentication.strategies.local`
- When LDAPStrategy is bound to `authentication.strategies.ldap`
- When OAuth2Strategy is bound to `authentication.strategies.oauth2`
- AuthenticationManager should be able to list all extensions bound to `authentication.strategies.*`

# Scenario - find one of its extensions by name for a given extension point

- Given a context
- Given a class `AuthenticationManager` as the extension point for extensible authentication strategies
- Given a class `LocalStrategy` that implements the `local` authentication strategy
- Given a class `LDAPStrategy` that implements the `ldap` authentication strategy
- Given a class `OAuth2Strategy` that implements the `oauth2` authentication strategy
- When LocalStrategy is bound to `authentication.strategies.local`
- When LDAPStrategy is bound to `authentication.strategies.ldap`
- When OAuth2Strategy is bound to `authentication.strategies.oauth2`
- AuthenticationManager should be able to find/get LocalStrategy by `local` from the context
- AuthenticationManager should be able to find/get LDAPStrategy by `ldap` from the context
- AuthenticationManager should be able to find/get OAuth2Strategy by `oauth2` from the context

# Scenario - populate configuration for extension points and extension

- Given a context
- Given a class `AuthenticationManager` as the extension point for extensible authentication strategies
- Given a class `LocalStrategy` that implements the `local` authentication strategy
- Given a class `LDAPStrategy` that implements the `ldap` authentication strategy
- Given a class `OAuth2Strategy` that implements the `oauth2` authentication strategy
- When LocalStrategy is bound to `authentication.strategies.local`
- When LDAPStrategy is bound to `authentication.strategies.ldap`
- When OAuth2Strategy is bound to `authentication.strategies.oauth2`
- Given a configuration object
```js
{
  'authentication.strategies': {
    local: { /* config for local strategy */},
    ldap: { /* config for ldap strategy */}
    oauth2: { /* config for oauth2 strategy */}
  }
}
```
- Each of the strategy class should be able to receive its configuration via dependency injection. For example,

```ts
class LocalStrategy implements AuthenticationStrategy {
  constructor(@inject('config') private config: LocalConfig) {}
}
```

# TBD

- Should we go beyond naming conventions to make ExtensionPoint/Extension first class entity of the context?
- Should we introduce decorators such as `@extensionPoint` and `@extension`?
