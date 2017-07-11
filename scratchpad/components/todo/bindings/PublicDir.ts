import {inject} from '@loopback/core';

const PUBLIC_DIR = 'publicDir';

export class PublicDir {
  name = PUBLIC_DIR;
  value() {
    return path.join(__dirname, '..', '..', '..', 'public'); 
  }
}

export const publicDir = () => {
  return inject(PUBLIC_DIR);
}