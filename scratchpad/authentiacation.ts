
export class Authenticate {
  constructor(
    private @inject('authentication.required') required,
    private @inject('authentication.user') user
  )
  static name = 'authentication.user';
  value() {
    console.log(this.user); // {username: ...};
    return () => {
        const isAuthRequired = this.required;
        const user = this.user;

        if (isAuthRequired && !user) {
          throw ...;
        }
    }
  }
}

// @loopback/core
export class Invoke {
  constructor(
    private @inject('controller') controller,
    private @inject('method') method,
    private @inject('args') args,
  )
  static name = 'invoke';
  func() {
    return controller[method](args);
  }
}
