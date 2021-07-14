---
lang: en
title: 'Building an Angular Application from OpenAPI Specification'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Angular, Frontend
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Building-frontend-angular-application.html
---

If you create REST APIs using LoopBack and need to build a front-end application
that consumes the APIs, the OpenAPI specification can be used to generate the
models and web client in an Angular application using
[ng-openapi-gen](https://www.npmjs.com/package/ng-openapi-gen) Node.js module.

Here are the steps:

## Prerequisite

Install the [ng-openapi-gen](https://www.npmjs.com/package/ng-openapi-gen)
module and [Angular CLI](https://www.npmjs.com/package/@angular/cli) by running
the following commands:

```sh
npm install -g ng-openapi-gen
npm install -g @angular/cli
```

You can check out [Angular documentation](https://angular.io/docs) for more
details.

## Step 1: Generate the OpenAPI specification from the LoopBack application

The OpenAPI spec from a LoopBack application can be obtained by starting the
application and then go to `http://localhost:3000/openapi.json`. It can also be
obtained by running the following command without starting the server:

```sh
npm run openapi-spec
```

Save the OpenAPI spec in a file which will be used later.

## Step 2: Generate an Angular application

Run the following command to run:

```sh
ng new <application-name>
```

## Step 3: Generate models and web client in the Angular application

Use the `ng-openapi-gen` command to generate the models and web client for the
Angular application based on the OpenAPI spec generated from the LoopBack
application.

```sh
ng-openapi-gen --input <path-to-openapi-json> --output <angular-app-path>/src/app/api
```

You will see `src/app/api` folder is created, where the models are under the
`/models` folder and web client under the `/services` folder.

## Step 4: Update the `_rootUrl` in `base-service.ts`

Next, modify the URL of where the REST APIs can be invoked. In the Angular
application, go to `src/app/api/base-service.ts` and modify the `_rootUrl`
variable value to where the REST APIs can be reached. This is the base URL of
the REST APIs, for example, `http://localhost:3000`.

## Step 5: Create a Component that calls the REST endpoints

A Component can be created using `ng generate component <component-name>`
command, and then a set of files in `src/app/<component-name>` will be created.
Two files need to be modified:

- `*/<component-name>.component.ts`: calls the REST APIs to retrieve data
- `*/<component-name>.component.html`: displays the data

Taking an example of the
[todo application](https://loopback.io/doc/en/lb4/todo-tutorial.html),

1. Updates `src/app/todolist/todolist.component.ts` to get the data through the
   controller service within the Angular application.

   ```ts
   // Add these imports
   import {Todo} from '../api/models/todo';
   import {TodoControllerService} from '../api/services/todo-controller.service';
   // ..
   export class TodolistComponent implements OnInit {
     // add `todos` variable which holds the todo list
     todos: Todo[];
     // add a todoService parameter of type TodoControllerService to the constructor
     constructor(private todoService: TodoControllerService) {}
     // update this method to get the todo list on init
     ngOnInit(): void {
       this.getTodos();
     }
     // add a new function getTodos to get the todo list from the service
     getTodos(): void {
       this.todoService.findTodos().subscribe(todos => (this.todos = todos));
     }
   }
   ```

2. Update `src/app/todolist/todolist.component.html` to display the data from
   the REST calls.

   ```html
   <ul class="todos">
     <li *ngFor="let todo of todos">
       <span class="badge">{{todo.title}}</span> - {{todo.desc}}
     </li>
   </ul>
   ```

## Step 6: Update app.component to import the required libraries

Update `app.module.ts` to import the required libraries. Since Http client is
required to call the REST APIs, `HttpClientModule` is needed. Depending on the
UI components to be added in the application, you also need to import those
libraries as well.

1. add the import

   ```ts
   import {HttpClientModule} from '@angular/common/http';
   ```

2. update the `@NgModule` decorator to include the `HttpClientModule`:

   ```ts
   @NgModule({
     declarations: [
       AppComponent,
       TodolistComponent
     ],
     imports: [
       BrowserModule,
       HttpClientModule // <----- add this line
     ],
     providers: [],
     bootstrap: [AppComponent]
   })
   ```
