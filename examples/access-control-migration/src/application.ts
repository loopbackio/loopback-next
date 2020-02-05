// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  AuthorizationComponent,
  AuthorizationTags,
} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingKey} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBindings,
} from './keys';
import {MySequence} from './sequence';
import {CasbinAuthorizationProvider} from './services/casbin.authorizer';
import {getCasbinEnforcerByName} from './services/casbin.enforcers';
import {JWTAuthenticationStrategy} from './services/jwt.auth.strategy';
import {JWTService} from './services/jwt.service';
import {SECURITY_SCHEME_SPEC} from './services/security.spec';
import {MyUserService} from './services/user.service';

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>('application.package');

export class AccessControlApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.setUpBindings();
    this.addSecuritySpec();

    this.component(RestExplorerComponent);
    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    // authorization
    this.bind('casbin.enforcer.factory').to(getCasbinEnforcerByName);
    this.bind('authorizationProviders.casbin-provider')
      .toProvider(CasbinAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    // authentication
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'access-control-example',
        version: require('.././package.json').version,
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}
