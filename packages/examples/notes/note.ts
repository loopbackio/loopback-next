import {
  rest,
  model,
  required,
  controller,
  PersistenceController,
  dataSource,
  Filter,
  controls
} from "./loopback";

@rest('/notes')
@def(require('./notes.json'))
export class NoteController extends PersistenceController {
  // customize via override
  public async find(filter : Filter) {
    let notes = await super.find(filter);
    notes.map(myMap);

    return Promise.resolve(notes);
  }

  // define remote methods in swagger + JSON/YAML
  // or in code via @decorators
  @path('/echo')
  @post
  @responds('body')
  public echo(@body msg : string) : string {
    let ctx = this.ctx;
    let ctrl = ctx.get<OtherController>('OtherController');
    return msg + ctx.get('Request').url;
  }

}

@model
export class Note {
  public summary() : string {
    return this.content.substr(0, 10) + '...';
  }

    @required
    public title: string;
    public content: string;
}

@rest('/notes')
// implies @controller
class NoteController extends PersistenceController<Note> {
    public authorize(target: any) {
        return true;
    }

    @path('/find')
    @get
    public async find<Note>(@queryParam('f') f: Filter): Promise<Note[]> {
        let notes: Note[] = await super.find<Note>(f);
        notes.map((note) => {
            return note;
        });

        return Promise.resolve(notes);
    }
}

function myMap(arr : any) {
  return arr;
}