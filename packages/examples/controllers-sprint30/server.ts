import * as http from 'http';

import HttpRouter from '@loopback/controllers';

import { HelloWorldSwaggerController } from './step1/HelloWorldSwaggerController';
import { HelloWorldDecoratedController } from './step2/HelloWorldDecoratedController';

// TODO - figure out how to deal with dependency injection,
// it is very likely to significantly change the code below
// However, I think @loopback/controllers should be ideally designed
// in a way that allows to use them even without DI/IoC
// Therefore the example below may remain valid even after DI/IoC is added

const router = new HttpRouter();

router.register(HelloWorldSwaggerController);
router.register(HelloWorldDecoratedController);

const server = http.createServer(router.handler);
server.listen(3000, () => {
  console.log('http://localhost:3000/hello-world-step1/hello?greeter=Miroslav');
  console.log('http://localhost:3000/hello-world-step2/hello?greeter=Miroslav');
});
