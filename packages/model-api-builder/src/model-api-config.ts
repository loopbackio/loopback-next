// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/model-api-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Configuration settings for individual model files. This type describes
 * content of `public-models/{model-name}.config.json` files.
 */
export type ModelApiConfig = {
  // E.g. 'Product'
  model: string;
  // E.g. 'RestCrud'
  pattern: string;
  // E.g. 'db'
  dataSource: string;
  // E.g. '/products'
  basePath: string;

  [patternSpecificSetting: string]: unknown;
};
