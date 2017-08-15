import {createApp} from './application';
import * as http from 'http';

const app = createApp();

const port = 3000;
const server = http.createServer(app.handleHttp);
server.listen(port, (err: Error) => {
  if (err) throw err;
  console.log(`HTTP server listening on port ${port}`);
  console.log(`Run \'curl localhost:${port}/helloworld?name=YOUR_NAME\' to try it out`);
});
