import {
    app,
    Application,
    Server,
    inject,
    Context
} from "./loopback";

import config = require('./app.json');

@app(config, __dirname)
export class MyApplication extends Application {
  public accept(ctx : Context) {
    return super.accept(ctx);
  }
}
