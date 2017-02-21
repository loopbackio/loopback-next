import {Application, Server, AccessToken} from "loopback";
import {UserController} from "./controllers/users";

let app = new Application();
let server = new Server();

server.bind('applications.app').to(app);
app.bind('controllers.users').to(UserController);
app.bind('userId').to(42);

await server.start();

console.log('server listenting on', server.info());


