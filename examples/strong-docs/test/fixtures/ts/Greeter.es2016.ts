/** Class representing a greeter. */
export class Greeter {
  /**
   * constructor comments
   * @param names An array of valid names
   */
  constructor(private names: string[]) {
    this.names = names;
  }
  greet(name: string) {
    if (this.isValid(name)) {
      return 'Hello, ' + name;
    } else {
      return 'Sorry, ' + name;
    }
  }

  private isValid(name: string) {
    // `includes` is only available since ES2016
    return this.names.includes(name);
  }
}

let greeter = new Greeter(['John', 'Mary']);
greeter.greet('John');
greeter.greet('Smith');
