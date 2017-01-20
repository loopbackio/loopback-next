import {
  rest,
  model,
  required,
  controller,
  PersistenceController,
  Filter
} from "../../loopback";

let settings = require('./notes.json');

@model
class Note {
  public summary() : string {
    return this.content.substr(0, 10) + '...';
  }

  @required
  public title : string;
  public content : string;
}

@rest('/notes')
// implies @controller
class NoteController extends PersistenceController {
  public authorize(target : any) {
    return true;
  }

  @path('/find')
  @get
  public find<Note>(@queryParam('f') f : Filter) {
    let notes = await super.find(f);
    notes.map(myMap);

    return Promise.resolve(notes);
  }
}