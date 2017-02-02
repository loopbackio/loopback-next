import {Collection, DataSource} from 'loopback';

export default NoteCollection;

@dataSource('db')
NoteCollection extends Collection {

}
