// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ConnectionOptions} from 'typeorm';

/**
 * Configuration for typeorm component
 */
export type TypeOrmConfig = ConnectionOptions | ConnectionOptions[];
