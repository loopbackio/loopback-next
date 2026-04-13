// Copyright (c) 2023 Sourcefuse Technologies
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {
  BearerVerifierBindings,
  BearerVerifierComponent,
  BearerVerifierConfig,
  BearerVerifierType,
  CoreComponent,
  ILogger,
  LOGGER,
  ServiceSequence,
} from '@sourceloop/core';
import {AuthenticationComponent} from 'loopback4-authentication';
import {
  AuthorizationBindings,
  AuthorizationComponent,
} from 'loopback4-authorization';
import * as path from 'node:path';
import {McpComponent} from '../../component';
import {ProjectSummaryController} from '../helpers/sample-controller';
import {ApplicationConfig} from '@loopback/core';

process.env.JWT_ISSUER = 'test-issuer';
process.env.JWT_SECRET = 'test-secret';
export class TestingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    const mockLogger: ILogger = {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
    this.bind(LOGGER.LOGGER_INJECT).to(mockLogger);
    this.component(RestExplorerComponent);
    this.component(CoreComponent);
    this.component(AuthenticationComponent);
    this.controller(ProjectSummaryController);
    this.component(McpComponent);
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer'],
    });
    this.component(AuthorizationComponent);
    this.bind(BearerVerifierBindings.Config).to({
      type: BearerVerifierType.service,
      useSymmetricEncryption: true,
    } as BearerVerifierConfig);
    this.component(BearerVerifierComponent);
    this.sequence(ServiceSequence);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.js'],
        nested: true,
      },
    };
  }
}
