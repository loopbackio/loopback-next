import loopback = require('loopback');

@loopback.boot
@inject('server')
function boot(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);
}
