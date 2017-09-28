# Feature: Context bindings - injecting dependencies of classes

- In order to manage my dependencies
- As a developer
- I want to setup bindings for my classes
- So that class dependencies are injected by the IoC framework

## Scenario: Inject constructor arguments

 - Given a context
 - Given class `InfoController` with a constructor
    accepting a single argument `appName: string`
 - Given `InfoController` ctor argument is decorated
     with `@inject('application.name')`
 - Given a static binding named `application.name` with value `CodeHub`
 - Given a class binding named `controllers.info` bound to class `InfoController`
 - When I resolve the binding for `controllers.info`
 - Then I get a new instance of `InfoController`
 - And the instance was created with `appName` set to `CodeHub`

 ```ts
 const ctx = new Context();
 ctx.bind('application.name').to('CodeHub');

 class InfoController {
   constructor(@inject('application.name') public appName: string) {
   }
 }
 ctx.bind('controllers.info').toClass(InfoController);

 const instance = await ctx.get('controllers.info');
 instance.appName; // => CodeHub
 ```

## Scenario: Inject instance properties

 - Given a context
 - Given class `InfoController` with a `appName: string` property
 - Given `InfoController` with `appName` property decorated
     with `@inject('application.name')`
 - Given a static binding named `application.name` with value `CodeHub`
 - Given a class binding named `controllers.info` bound to class `InfoController`
 - When I resolve the binding for `controllers.info`
 - Then I get a new instance of `InfoController`
 - And the instance was created with `appName` set to `CodeHub`

 ```ts
 const ctx = new Context();
 ctx.bind('application.name').to('CodeHub');

 class InfoController {
   @inject('application.name')
   appName: string;
 }
 ctx.bind('controllers.info').toClass(InfoController);

 const instance = await ctx.get('controllers.info');
 instance.appName; // => CodeHub
 ```
