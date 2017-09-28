# Feature: Context bindings - injecting dependencies of methods

- In order to receive information from the context for a method
- As a developer
- I want to setup bindings for my method
- So that method dependencies are injected by the IoC framework

## Scenario: Inject method arguments

 - Given a context
 - Given class `InfoController`
 - Given a class binding named `controllers.info` bound to class `InfoController`
 - When I resolve the binding for `controllers.info`
 - Then I get a new instance of `InfoController`
 - When I invoke the `hello` method, the parameter `user` is resolved to the
 - value bound to `user` key in the context

 ```ts
 class InfoController {

   static say(@inject('user') user: string):string {
     const msg = `Hello ${user}`;
     console.log(msg);
     return msg;
   }

   hello(@inject('user') user: string):string {
     const msg = `Hello ${user}`;
     console.log(msg);
     return msg;
   }

   greet(prefix: string, @inject('user') user: string):string {
     const msg = `[${prefix}] Hello ${user}`;
     console.log(msg);
     return msg;
   }
 }

 const ctx = new Context();
 // Mock up user authentication
 ctx.bind('user').toDynamicValue(() => Promise.resolve('John'));
 ctx.bind('controllers.info').toClass(InfoController);

 const instance = await ctx.get('controllers.info');
 // Invoke the `hello` method => Hello John
 const helloMsg = await invokeMethod(instance, 'hello', ctx);
 // Invoke the `greet` method with non-injected args => [INFO] Hello John
 const greetMsg = await invokeMethod(instance, 'greet', ctx, ['INFO']);

 // Invoke the static `sayHello` method => [INFO] Hello John
 const greetMsg = await invokeMethod(InfoController, 'sayHello', ctx);
 ```


