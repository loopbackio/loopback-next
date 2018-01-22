/*
given a specific directory, traverse it and map its files and other directories in memory.
if a request matching the path comes in, then load the file. if it's for the directory,
look for index.html to render the page
*/
import {Binding, Context, Constructor, inject} from '@loopback/context';
import {Application, CoreBindings, Server} from '@loopback/core';
import * as path from 'path';
import * as fs from 'fs';
import * as Http from 'http';
import {RestBindings} from '../index';
import {Route} from './index';
import * as glob from 'glob';
import {SequenceHandler, SequenceFunction, DefaultSequence} from './sequence';
import * as mime from '@types/mime';
import {ParsedRequest} from './internal-types';
import {SequenceActions} from './rest-application';

export class StaticServer extends Context implements Server {
  protected _httpServer: Http.Server;
  public root: string;

  constructor(
    root: string,
    @inject(RestBindings.Http.INSTANCE) httpInstance: Http.Server,
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
  ) {
    super();
    this._httpServer = httpInstance;
    this.root = root;

    if (!this._httpServer) {
      this._httpServer = Http.createServer(this.handleHttp);
      app.bind(RestBindings.Http.INSTANCE).to(this._httpServer);
    }
  }

  start(): Promise<void> {
    const httpServer = this._httpServer;
    httpServer.listen();

    return new Promise<void>((resolve, reject) => {
      httpServer.once('listening', () => {
        resolve();
      });
      httpServer.once('error', reject);
    });
  }
  stop(): Promise<void> {
    // Kill the server instance.
    const server = this._httpServer;
    return new Promise<void>((resolve, reject) => {
      server.close((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  handleHttp(request: Http.ServerRequest, response: Http.ServerResponse) {
    if (request.method !== 'GET' || 'HEAD') {
      response.statusCode = 405;
      response.setHeader('Allow', 'GET, HEAD');
      response.setHeader('Content-Length', '0');
      response.end();
    }

    /*    fs.exists(request.path, exists => {
      if (!exists) {
        response.statusCode = 404;
        response.setHeader('Content-Length', '0');
        response.end('File ${request.path} could not be found.');
      }

      fs.readFile(request.path, (err, data) => {
        if (err) {
          return _onUnhandledError(request, response, err);
        } else {
          const type = mime.getType(path.parse(request.path).ext);
          response.setHeader('content-type', type as string);
          response.statusCode = 200;
          if (request.method === 'GET') {
            response.end(data);
          } else {
            response.end();
          }
        }
      });
    }); */
  }

  readFolders(givenPath: string[] | string) {
    const workDir = path.resolve(process.cwd(), givenPath);
    const fileRegistry = new Map<string, string | null>();
    // tslint:disable-next-line:no-shadowed-variable
    for (let path in givenPath) {
      if (fs.statSync(path).isDirectory()) {
        glob('**/*', {root: workDir}, (err, files) => {
          if (err) throw err;
          for (let f in files) {
            fileRegistry.set(f, mime.getType(path.extname(f)));
          }
          return fileRegistry;
        });
      } else if (fs.statSync(path).isFile()) {
        return fileRegistry.set(path, mime.getType(path.extname));
      }
    }
  }
}

class staticSequence implements SequenceHandler {
  handle(request: ParsedRequest, response: Http.ServerResponse): Promise<void> {
    return this.handle(request, response);
  }
}
