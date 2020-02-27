import {Model} from '../../../index';

export interface FindByTitleInterface<M extends Model> {
  findByTitle(title: string): Promise<M[]>;
}
