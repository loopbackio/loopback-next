import { inject } from "inversify";
import {
    app,
    Application,
    Server
} from "./loopback";


@app(__dirname)
export class Notes {
  constructor(@inject(Server) public server : Server) {}
}