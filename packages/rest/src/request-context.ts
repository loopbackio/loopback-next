// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import * as onFinished from 'on-finished';
import {RestBindings} from './keys';
import {RestServerResolvedConfig} from './rest.server';
import {HandlerContext, Request, Response} from './types';

/**
 * A per-request Context combining an IoC container with handler context
 * (request, response, etc.).
 */
export class RequestContext extends Context implements HandlerContext {
  /**
   * Get the protocol used by the client to make the request.
   * Please note this protocol may be different from what we are observing
   * at HTTP/TCP level, because reverse proxies like nginx or sidecars like
   * Envoy are switching between protocols.
   */
  get requestedProtocol(): string {
    return (
      (this.request.get('x-forwarded-proto') || '').split(',')[0] ||
      this.request.protocol ||
      this.serverConfig.protocol ||
      'http'
    );
  }

  /**
   * Get the effective base path of the incoming request. This base path
   * combines `baseUrl` provided by Express when LB4 handler is mounted on
   * a non-root path, with the `basePath` value configured at LB4 side.
   */
  get basePath(): string {
    const request = this.request;
    let basePath = this.serverConfig.basePath || '';
    if (request.baseUrl && request.baseUrl !== '/') {
      if (!basePath || request.baseUrl.endsWith(basePath)) {
        // Express has already applied basePath to baseUrl
        basePath = request.baseUrl;
      } else {
        basePath = request.baseUrl + basePath;
      }
    }
    return basePath;
  }

  /**
   * Get the base URL used by the client to make the request.
   * This URL contains the protocol, hostname, port and base path.
   * The path of the invoked route and query string is not included.
   *
   * Please note these values may be different from what we are observing
   * at HTTP/TCP level, because reverse proxies like nginx are rewriting them.
   */
  get requestedBaseUrl(): string {
    const request = this.request;
    const config = this.serverConfig;

    const protocol = this.requestedProtocol;
    // The host can be in one of the forms
    // [::1]:3000
    // [::1]
    // 127.0.0.1:3000
    // 127.0.0.1
    let {host, port} = parseHostAndPort(
      request.get('x-forwarded-host') || request.headers.host,
    );

    const forwardedPort = (request.get('x-forwarded-port') || '').split(',')[0];
    port = forwardedPort || port;

    if (!host) {
      // No host detected from http headers
      // Use the configured values or the local network address
      host = config.host || request.socket.localAddress;
      port = (config.port || request.socket.localPort).toString();
    }

    // clear default ports
    port = protocol === 'https' && port === '443' ? '' : port;
    port = protocol === 'http' && port === '80' ? '' : port;

    // add port number of present
    host += port !== '' ? ':' + port : '';

    return protocol + '://' + host + this.basePath;
  }

  constructor(
    public readonly request: Request,
    public readonly response: Response,
    parent: Context,
    public readonly serverConfig: RestServerResolvedConfig,
    name?: string,
  ) {
    super(parent, name);
    this._setupBindings(request, response);
    onFinished(this.response, () => {
      // Close the request context when the http response is finished so that
      // it can be recycled by GC
      this.close();
    });
  }

  private _setupBindings(request: Request, response: Response) {
    this.bind(RestBindings.Http.REQUEST)
      .to(request)
      .lock();

    this.bind(RestBindings.Http.RESPONSE)
      .to(response)
      .lock();

    this.bind(RestBindings.Http.CONTEXT)
      .to(this)
      .lock();
  }
}

function parseHostAndPort(host: string | undefined) {
  host = host || '';
  host = host.split(',')[0];
  const portPattern = /:([0-9]+)$/;
  const port = (host.match(portPattern) || [])[1] || '';
  host = host.replace(portPattern, '');
  return {host, port};
}
