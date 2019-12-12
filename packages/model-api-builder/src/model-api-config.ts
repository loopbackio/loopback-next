// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/model-api-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model} from '@loopback/repository';

/**
 * Configuration settings for individual model files. This type describes
 * content of `public-models/{model-name}.config.json` files.
 */
export type ModelApiConfig = {
  /**
   * The model class that the repository and controller are to be built from.
   * e.g. Product (a Model class)
   */
  model: typeof Model & {prototype: Model};

  /**
   * Name of data-access pattern describing the API builder. Users can
   * customize and use a unique pattern name.
   * e.g. 'RestCrud'
   */
  pattern: string;

  /**
   * The dataSource the model uses under the hood.
   * e.g. 'db'
   */
  dataSource: string;

  [patternSpecificSetting: string]: unknown;
};
