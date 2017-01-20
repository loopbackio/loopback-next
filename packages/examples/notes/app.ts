import {
    root,
    app,
    Application,
    Server,
    inject
} from "./loopback";

@app
export class MyApplication extends Application {
  constructor() {
    super();
  }
}
