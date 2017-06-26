# @loopback/logging

A LoopBack component for logging.

## Log Format

### bunyanLOGGER
```javascript
{
  "name":"bunyanLOGGER",
  "hostname":"TSetoMBP.local",
  "pid":6139,
  "level":30,
  "msg":"*** HTTP server started on port 3000",
  "time":"2017-07-08T21:14:09.318Z",
  "v":0
}
```

### morganHTTP
```javascript
{
  "name": "morganHTTP",
  "responseTime": "8.114",
  "url": "/helloworld?name=LoopBack.Next.Logger",
  "method": "GET",
  "status": "200",
  "httpVersion": "1.1",
  "userAgent": "curl/7.51.0",
  "time": "2017-07-08T21:14:45.316Z",
  "pid": 6139
}
```

## Client Example: hello-world

### application.ts
```javascript
import {Application} from '@loopback/core';
import {Logger, LoggingOptions} from '@loopback/logging';
import {HelloWorldComponent} from './components/hello-world';

export class HelloWorldApplication extends Application {
  private logger: Logger;
  constructor() {
    super({
      components: [HelloWorldComponent],
    });
    const options: LoggingOptions = { http: true };
    this.logger = new Logger(this, options);
  }
  get log() {
    return this.logger.log;
  }  
}
```

### index.ts
```javascript
import {HelloWorldApplication} from './application';
import {HelloWorldController} from './components/hello-world/controllers/hello-world';
import * as http from 'http';

const app = new HelloWorldApplication();
app.controller(HelloWorldController);

const port = 3000;
const server = http.createServer(app.handleHttp);
server.listen(3000, (err) => {
  if (err) {
    app.log.error(err);
    throw err;
  }
  app.log.info(`*** HTTP server started on port ${3000}`);
  console.log(`HTTP server listening on port ${3000}`);
  console.log('Run `curl localhost:3000/helloworld?name=YOUR_NAME` to try it out');
});
```





