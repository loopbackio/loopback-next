// file: packages/authentication/bindings/authenticate.ts

export class AuthenticatedUser {
  constructor(
    private @inject('authentication.required') required,
    private @inject('http.request') req,
    private @inject('authentication.strategy') strategy,
  )
  static name = 'authentication.user';
  async value() {
    const user = await this.strategy.authenticate(this.req);

    // ...

    return user;
  }
}

export class AuthenticatedRequired {
  constructor(
    private @inject('controller.method.meta') meta,
  )
  static name = 'authentication.required';
  value() {
    return this.meta.authenticationMeta;
  }
}

export class Meta {
  constructor(
    private @inject('controller.method.meta') meta,
  )
  static name = 'authentication.required';
  value() {
    return this.meta.authenticationMeta;
  }
}
