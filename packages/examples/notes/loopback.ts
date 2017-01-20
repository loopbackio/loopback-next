import { inject, Container } from "inversify";
import { Promise } from "bluebird";
import express = require('express');

export { inject, Container };

export function main() {
  
}

export class Server {
  constructor(public registry : Container) {
    // abstract express constructor
    this.expressApp = express();
    this.expressApp.use(async (req, res, next) => {
      let app = registry.get("app") as Application;
      let ctx = new Container();
      ctx.parent = registry;
      ctx.bind("req").toConstantValue(req);
      ctx.bind("res").toConstantValue(res);
      
      // find controller
      // find the method to invoke

      await app.accept(ctx);
    });
  }
  public expressApp : any;
  public listen(port : Number) {
    return Promise.promisify(this.expressApp.listen)(port);
  }
}

export class Context extends Container {

}

export class Application {
  constructor(public registry : Container) {
    registry.bind("app").toConstantValue(this);
    registry.bind("server").toConstantValue(new Server(registry));
  }

  public server : Server;
  public accept(ctx : Context) {
    
  }

  public start() {
    this.server.listen(this.registry.get('port') as number);
  }
}

export function app(dir : string, parent : any) {
  return function(MyApplication: any) {
    let registry = new Container();
    if (parent) {
      registry.parent = parent.registry;
    }
    let app = new MyApplication(registry);
  }
}

export function model(ctor : Function) {

}

export function controller(ctor : Function) {

}

export function rest(url : string) {
  return function(ctor : Function) {

  }
}

export function required(target : any, key : string) {

}

export class PersistenceController {
  public 

  public authorize(target : any) {
    
  }

  public authenticate(credentials : any) {

  }

  public find<T>(filter : Filter){
    return [];
  }
}

export class Filter {
  public limit : number;
  public where : any;
  public skip : number;
  public sort : SortOrder
}

enum SortOrder {
  asc,
  desc
}