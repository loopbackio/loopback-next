import { main, Container } from "./loopback";
import { MyApplication } from "./app";

@main
function main() {
  let root = new Container();
  let app = new MyApplication();
}
