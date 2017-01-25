import { Application, AppConfig } from '../../loopback';
import { Client } from './client';


class Util {
  public createApp(config: AppConfig) : Application {
    return new Application(config);
  }
  public createClient(app : Application) {
    return new Client(app);
  }
}



export default new Util;