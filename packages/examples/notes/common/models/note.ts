import {
    rest,
    path,
    get,
    queryParam,
    model,
    required,
    controller,
    PersistenceController,
    Filter
} from "../../loopback";

let settings = require('./notes.json');

@model
class Note {
    public summary(): string {
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