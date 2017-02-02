import {Collection, dataSource} from "loopback";

@dataSource('db')
export NoteCollection extends Collection {

}