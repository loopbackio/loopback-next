// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

import path from 'path';
import SG from 'strong-globalize';

SG.SetRootDir(path.join(__dirname, '..'), {autonomousMsgLoading: 'all'});
export const g = new SG();
