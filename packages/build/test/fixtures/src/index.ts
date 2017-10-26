function log() {
  return function(target: object | Function) {}  
}

@log()
export class Hello {
  constructor(public name: string) {}

  greet(msg: string) {
    return `Hello, ${this.name}: ${msg}`;
  }
}