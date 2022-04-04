import {Server} from '@loopback/core';
import {createServer, Server as TLSServer, TLSSocket} from 'tls';

export class GeminiServer implements Server {
  private _server?: TLSServer;

  listening: boolean;

  async start() {
    this._server = createServer({
      SNICallback: serverName => {},
      minVersion: 'TLSv1.2', // Override CLI options (if any)
    });

    this._server.listen('8000');
    this._server.on('secureConnection', this._connectionHandler);
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server?.close(err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  requestHandler: (request: {url: string}) => Promise<void> | void;

  private _connectionHandler(socket: TLSSocket) {
    let urlBuffer = Buffer.from('');
    let isInitialData = true;

    const socketDataHandler = (data: Buffer) => {
      if (isInitialData) {
        if (data.subarray(0, 1).toString() === '\uFEFF') throw new Error();
        isInitialData = false;
      }

      if (data.subarray(data.length - 2, 2).toString() === '\000D\000A') {
        if (urlBuffer.length + data.length - 2 > 1024) socket.end();

        urlBuffer = Buffer.concat(
          [urlBuffer, data],
          urlBuffer.length + data.length - 2,
        );

        Promise.resolve(this.requestHandler({url: urlBuffer.toString()}))
          .then(() => socket.end())
          .catch(reason => {
            throw reason;
          });
      } else {
        if (urlBuffer.length + data.length > 1024) socket.end();
        else urlBuffer = Buffer.concat([urlBuffer, data]);
      }
    };

    function socketInitialDataHandler(data: Buffer) {
      socketDataHandler(data);
      socket.removeListener('data', socketInitialDataHandler);
      socket.on('data', socketDataHandler);
    }

    socket.on('data', socketInitialDataHandler);
  }
}
