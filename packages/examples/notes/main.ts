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
}