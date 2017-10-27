/**
 * log decorator
 */
export function log() {
  return function(target: object | Function) {};
}

/**
 * Hello class
 */
@log()
export class Hello {
  constructor(public name: string) {}

  /**
   * Return a greeting
   * @param msg Message
   */
  greet(msg: string) {
    return `Hello, ${this.name}: ${msg}`;
  }
}
