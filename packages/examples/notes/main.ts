import { main, Container, Controller, Model } from "./loopback";
import { MyApplication } from "./app";
import { Note, NoteController } from "./note";

@main
function main() {
  let globalRegistry = new Container();
  globalRegistry.bind<Model>("Model").to(Note);
  globalRegistry.bind<Controller>("Controller").to(NoteController);

  let appRegistry = new Container();
  appRegistry.parent = globalRegistry;
  let app = new MyApplication(appRegistry);

  // this code will certainly change quite a bit
  app.on('request', (req, res) => {
    let requestRegistry = new Container();
    requestRegistry.parent = appRegistry;
    requestRegistry.bind('req').to(req);
    requestRegistry.bind('res').to(res);
  });
}