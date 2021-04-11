import {BaseArtifactBooter} from '@loopback/boot';
import {Application, CoreBindings, inject} from '@loopback/core';
import {IWaterlineMixin} from './mixin';
import {CollectionClassProvider} from './waterline-model.provider';

export class WaterlineCollectionClassBooter extends BaseArtifactBooter {
  @inject(CoreBindings.APPLICATION_INSTANCE)
  private _app: Application & IWaterlineMixin;

  async load() {
    await super.load();

    for (const model of this.classes) {
      if (model.prototype instanceof CollectionClassProvider)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this._app.waterlineCollectionClass(model);
    }
  }
}
