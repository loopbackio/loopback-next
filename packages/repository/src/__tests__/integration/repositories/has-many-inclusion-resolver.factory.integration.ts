       // put this test back to repository/factory... cuz for some reason it says createHasManyInclusionResolver is not a function

        // describe.only('HasMany inclusion resolvers - integration', () =>{
        //     before(deleteAllModelsInDefaultDataSource);
        //     let categoryRepo: EntityCrudRepository<
        //         Category,
        //         typeof Category.prototype.id,
        //         CategoryRelations
        //     >;
        //     let productRepo: EntityCrudRepository<
        //         Product,
        //         typeof Product.prototype.id,
        //         ProductRelations
        //     >;
        //     before(
        //         withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        //             // this repo doesn't have registered resolvers yet
        //             categoryRepo = new repositoryClass(Category, ctx.dataSource);
        //             productRepo = new repositoryClass(Product, ctx.dataSource);

        //             // inclusionResolvers should be defined, and no resolvers setup yet
        //             expect(categoryRepo.inclusionResolvers).to.not.be.undefined();
        //             expect(categoryRepo.inclusionResolvers).to.deepEqual(new Map());
        //             expect(productRepo.inclusionResolvers).to.not.be.undefined();

        //             console.log(productRepo);
        //             const productMeta = Category.definition.relations.products;
        //             const hasManyProductsResolver: InclusionResolver<Category, Product> = createHasManyInclusionResolver(
        //                 productMeta as HasManyDefinition,
        //                 async () => productRepo,
        //             );
        //             categoryRepo.inclusionResolvers.set('products', hasManyProductsResolver);

        //             await ctx.dataSource.automigrate([Category.name, Product.name]);
        //         }),
        //         );
    
        //         beforeEach(async () => {
        //         await categoryRepo.deleteAll();
        //         await productRepo.deleteAll();
        //         });
        //         it.only('ignores navigational properties when updating model instance', async () => {
        //             const created = await categoryRepo.create({name: 'Stationery'});
        //             const categoryId = created.id;
            
        //             await productRepo.create({
        //               name: 'Pen',
        //               categoryId,
        //             });
            
        //             const found = await categoryRepo.findById(categoryId, {
        //               include: [{relation: 'items'}],
        //             });
        //             expect(found.products).to.have.lengthOf(1);
            
        //             found.name = 'updated name';
        //             const saved = await categoryRepo.save(found);
        //             expect(saved.name).to.equal('updated name');
            
        //             const loaded = await categoryRepo.findById(categoryId);
        //             expect(loaded.name).to.equal('updated name');
        //             expect(loaded).to.not.have.property('items');
        //           });


        // });