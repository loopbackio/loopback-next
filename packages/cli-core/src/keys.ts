// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli-core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import type {Cli} from './cli';

export const CLI_KEY = BindingKey.create<Cli>('cli');
