// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export * from './application';
export * from './component';
export * from './greeting-service';
export * from './keys';
export * from './types';

import {GreetingApplication} from './application';
if (require.main === module) {
  const app = new GreetingApplication();
  app.main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
