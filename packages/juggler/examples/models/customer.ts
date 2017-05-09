import {model} from '../../src/decorator';
import {Entity, ModelProperty} from '../../src/model';

@model(require('./customer.definition'))
export class Customer extends Entity {

}