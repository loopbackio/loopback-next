import {jugglerModule, bindModel, DataSource, Model} from '../../../lib/legacy';

let ds = new DataSource({
  name: 'db',
  connector: 'memory'
});

console.log(ds.name);

let Note = ds.createModel('note', {title: 'string', content: 'string'}, {});
console.log(bindModel(ds, Note).modelName);
