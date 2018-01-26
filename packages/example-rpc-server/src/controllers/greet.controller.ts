import {Person} from '../models';

export class GreetController {
  basicHello(input: Person) {
    return `Hello, ${(input && input.name) || 'World'}!`;
  }

  hobbyHello(input: Person) {
    return `${this.basicHello(input)} I heard you like ${(input &&
      input.hobby) ||
      'underwater basket weaving'}.`;
  }
}
