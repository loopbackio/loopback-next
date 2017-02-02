import { api, collection } from 'loopback';
import { NoteCollection } from './note.collection';

@api(require('./notes.api.json'))
export class NoteController {
  @operationId('notes.echo')
  echo(msg : string) {
    return msg;
  }

  @collection('notes')
  public collection : NoteCollection;

  @collection.instance('notes')
  public note : Note;

  @operationId('notes.find')
  find(limit : number) {
    return this.collection.find({limit: limit});
  }
}