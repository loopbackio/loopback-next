// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Context,
  createBindingFromClass,
  inject,
  service,
} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {GraphQLResolveInfo} from 'graphql';
import {
  Arg,
  Field,
  FieldResolver,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
  ResolverData,
  Root,
} from 'type-graphql';
import {GraphQLTags, LoopBackContainer} from '../..';

describe('LoopBack container for type-graphql', () => {
  let parentCtx: Context;
  let container: LoopBackContainer;
  const resolverData: ResolverData = {
    root: '',
    args: {},
    context: {},
    info: {} as unknown as GraphQLResolveInfo,
  };

  beforeEach(givenContainer);

  it('resolves from parent context', () => {
    parentCtx.add(createBindingFromClass(BookService));
    parentCtx.bind('graphql.resolvers.BookResolver').toClass(BookResolver);
    const resolver = container.get(BookResolver, resolverData);
    expect(resolver).to.be.instanceof(BookResolver);
  });

  it('resolves from parent context by key', () => {
    parentCtx.add(createBindingFromClass(BookService));
    parentCtx.bind('graphql.resolvers.BookResolver').toClass(BookResolver);
    parentCtx
      .bind('graphql.resolvers.AnotherBookResolver')
      .toClass(BookResolver);
    const resolver = container.get(BookResolver, resolverData) as BookResolver;
    // Prefer the binding with the same key
    expect(resolver.binding.key).to.eql('graphql.resolvers.BookResolver');
  });

  it('resolves from parent context with the first binding', () => {
    parentCtx.add(createBindingFromClass(BookService));
    // Add two bindings with RESOLVER tag
    parentCtx
      .bind('graphql.resolvers.BookResolver1')
      .toClass(BookResolver)
      .tag(GraphQLTags.RESOLVER);
    parentCtx
      .bind('graphql.resolvers.BookResolver2')
      .toClass(BookResolver)
      .tag(GraphQLTags.RESOLVER);
    const resolver = container.get(BookResolver, resolverData) as BookResolver;
    expect(resolver.binding.key).to.eql('graphql.resolvers.BookResolver1');
  });

  it('resolves from child context', () => {
    parentCtx.add(createBindingFromClass(BookService));
    const resolver = container.get(BookResolver, resolverData);
    expect(resolver).to.be.instanceof(BookResolver);
    expect(parentCtx.isBound('graphql.resolvers.BookResolver')).to.be.false();
  });

  it('resolves from middleware context', () => {
    const middlewareCtx = new Context('request');
    middlewareCtx.bind('graphql.resolvers.BookResolver').toClass(BookResolver);
    parentCtx.add(createBindingFromClass(BookService));
    const MIDDLEWARE_CONTEXT = Symbol.for('loopback.middleware.context');
    const resolverDataWithMiddlewareContext: ResolverData = {
      root: '',
      args: {},
      context: {
        request: {
          // Simulate an Express request with LoopBack middleware/request context
          [MIDDLEWARE_CONTEXT]: middlewareCtx,
        },
      },
      info: {} as unknown as GraphQLResolveInfo,
    };
    const resolver = container.get(
      BookResolver,
      resolverDataWithMiddlewareContext,
    );
    expect(resolver).to.be.instanceof(BookResolver);
    expect(parentCtx.isBound('graphql.resolvers.BookResolver')).to.be.false();
  });

  @ObjectType({description: 'Book'})
  class Book {
    @Field(type => ID)
    id: string;

    @Field()
    title: string;

    @Field(type => Int)
    protected numberInCollection: number;
  }

  class BookService {
    static books: Record<string, Book> = {
      '1': new Book(),
    };
    getOne(id: string) {
      return BookService.books[id];
    }
  }

  @Resolver(of => Book)
  class BookResolver {
    @inject.binding()
    readonly binding: Binding;

    constructor(
      // constructor injection of service
      @service()
      private readonly bookService: BookService,
    ) {}

    @Query(returns => Book, {nullable: true})
    async book(@Arg('bookId') bookId: string) {
      return this.bookService.getOne(bookId);
    }

    @FieldResolver()
    numberInCollection(@Root() book: Book): number {
      return 1;
    }
  }

  function givenContainer() {
    parentCtx = new Context();
    container = new LoopBackContainer(parentCtx);
  }
});
