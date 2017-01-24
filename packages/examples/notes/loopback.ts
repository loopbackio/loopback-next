import { inject, Container, tagged } from "inversify";
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
      
      registry.bind("RequestContext").toConstantValue(ctx);


      // find controller (factor into Router)
      let controllers = ctx.getAll<Controller>("Controller");
      for(var controller of controllers) {
        if (controller.path === req.url) {
          ctx.bind("currentController").toConstantValue(controller);
          ctx.bind("currentMethod").toConstantValue("find");


          await ctx.get('currentMethod').invoke(ctx);
        }
      }

      // find the method to invoke
      await app.accept(ctx);

      registry.unbind("RequestContext", ctx); // fixme
    });
  }
  public expressApp : any;
  public listen(port : Number) {
    let Promise = require('bluebird');
    return Promise.promisify(this.expressApp.listen)(port);
  }
}

export class Context extends Container {
  public req : NodeJS.ReadWriteStream;
  public res : NodeJS.WritableStream;
}

export class Application {
  constructor(public registry : Container) {
    registry.bind("app").toConstantValue(this);
    registry.bind("server").toConstantValue(new Server(registry));
  }

  public on(ev : string, cb : Function) {

  }

  public server : Server;
  public accept(ctx : Context) {
    ctx.get("currentController");
  }

  public start() {
    this.server.listen(this.registry.get('port') as number);
  }
}

export function app(config : any, dir : string, parent? : any) {
  // TODO
  // - import and bind controllers based on config
  // - bind data source + connector config into registry
  // - controllers will bind models themselves 

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

export function path(url : string) {
  return function(...args: any[]) {

  }
}

export function get(target : any, key: string, descriptor: PropertyDescriptor) {

}

export function queryParam(name?: string) {
    return function(target : any, key: string, descriptor: PropertyDescriptor) {
  };
}

export function required(target : any, key : string) {

}

export class Controller {
  constructor(public registry : Container) {}
}

export class PersistenceController extends Controller {

  public authorize(target : any) {
    
  }

  public authenticate(credentials : any) {

  }

  public find(filter : Filter) : any{
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

export class Controller {
  public path : String;
}

export class Model {

}

export function controls(modelClass : any) {
  return function(ctrl : any) {

  }
}

export function dataSource(name : any) {
  return function(ctrl : any) {

  }
}