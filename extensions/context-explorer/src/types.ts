// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Options to configure Context Explorer
 */
export type ContextExplorerConfig = {
  /**
   * URL path where to expose the context explorer endpoints. Default: '/context-explorer'
   */
  path?: string;

  /**
   * Set the flag to `false` to disable /inspect
   */
  enableInspection?: boolean;
  /**
   * Set the flag to `false` to disable /graph
   */
  enableSVG?: boolean;
  /**
   * Set the flag to `false` to disable /index.html and /dots
   */
  enableD3Animation?: boolean;
};
