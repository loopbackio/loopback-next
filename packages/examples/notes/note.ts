import 
  rest,
  model,
  required,
  controller,
  PersistenceController,
  Filter,
  Context
} from "./loopback";

let settings = require('./notes.json');

@rest('/notes')
// implies @controller
@dataSource('db')
@controls(Note)
export class NoteController extends PersistenceController {
  public find<Note>(@queryParam('f') f : Filter) {
    let notes = await super.find(f);
    notes.map(myMap);

    return Promise.resolve(notes);
  }

  @path('/echo')
  @post
  @responds('body')
  public echo(@body msg : string) : string {
    let ctx = this.ctx;
    let ctrl = ctx.get("OtherController") as NoteController;
    return msg + ctx.req.url;
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