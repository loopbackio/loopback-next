import {Packet} from 'socket.io';

export class DummySocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(_eventName: string | symbol, _cb: (...args: any[]) => void) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(_cb: (packet: Packet, next: (err?: any) => void) => void) {}
}
