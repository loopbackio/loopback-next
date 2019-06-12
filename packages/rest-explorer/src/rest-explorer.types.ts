// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Options to configure API Explorer UI
 */
export type RestExplorerConfig = {
  /**
   * URL path where to expose the explorer UI. Default: '/explorer'
   */
  path?: string;

  /**
   * By default, the explorer will add an additional copy of the OpenAPI spec
   * in v3/JSON format at a fixed url relative to the explorer itself. This
   * simplifies making the explorer work in environments where there may be
   * e.g. non-trivial URL rewriting done by a reverse proxy, at the expense
   * of adding an additional endpoint to the application. You may shut off
   * this behavior by setting this flag `false`, in which case the explorer
   * will try to locate an OpenAPI endpoint from the RestServer that is
   * already in the correct form.
   *
   * Note that, if you are behind such a reverse proxy, you still _must_
   * explicitly set an `openApiSpecOptions.servers` entry with an absolute path
   * (it does not need to include the protocol, host, and port) that reflects
   * the externally visible path, as that information is not systematically
   * forwarded to the application behind the proxy.
   */
  useSelfHostedSpec?: false;
};
