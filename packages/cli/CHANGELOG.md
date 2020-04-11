# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.3.0...@loopback/cli@2.3.1) (2020-04-11)


### Bug Fixes

* **cli:** make the StatusConflicter compatible with the base Conflicter ([b6a1af9](https://github.com/strongloop/loopback-next/commit/b6a1af98ccb0705ee3a802df68bb590ec74473f5))
* **cli:** remove unused imports from the crud controller template ([848272d](https://github.com/strongloop/loopback-next/commit/848272d980e94bc9f0878e678de12a336c0d8b8a))





# [2.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.2.1...@loopback/cli@2.3.0) (2020-04-08)


### Bug Fixes

* **cli:** allow `-h` for help ([f74092e](https://github.com/strongloop/loopback-next/commit/f74092eb20acd9e9ab1875c56ccbcb2e55f4c1da))
* **cli:** make sure generated package.json is well formatted ([38be23f](https://github.com/strongloop/loopback-next/commit/38be23f46f02ea380f1290f12704078925d264cd))
* **cli:** remove `All rights reserved.` from the header for LICENSE ([ce78b2a](https://github.com/strongloop/loopback-next/commit/ce78b2a81314aacb46b525121ecdfdbd97d0d94e))


### Features

* **cli:** add `lb4 copyright` to generate/update file headers ([abc6111](https://github.com/strongloop/loopback-next/commit/abc6111148a831f47308f4284215ac9564f3c12b))
* **cli:** add `updateLicense` to `lb4 copyright` command ([535df04](https://github.com/strongloop/loopback-next/commit/535df04df75d39f2a5e36740ae1e0de27359af78))
* **cli:** allow --exclude <glob-pattern> to not update headers for excluded files ([a81ce7e](https://github.com/strongloop/loopback-next/commit/a81ce7e1193f7408d30d984d0c3ddcec74f7c316))
* **cli:** implement dark mode in the app template ([6939546](https://github.com/strongloop/loopback-next/commit/6939546d2b0cba59d8a70ce500dbf1b6e42d682b))
* **cli:** print options for `lb4 copyright --help` and update docs ([f23ecb7](https://github.com/strongloop/loopback-next/commit/f23ecb741bcd589767d94acf2a394efddfe37ff6))
* **cli:** wrap license text with a max line length of 80 chars ([a9046ed](https://github.com/strongloop/loopback-next/commit/a9046ed639076bf8e06a0952c0ae2a298f92c330))





## [2.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.2.0...@loopback/cli@2.2.1) (2020-03-24)

**Note:** Version bump only for package @loopback/cli





# [2.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.1.1...@loopback/cli@2.2.0) (2020-03-24)


### Bug Fixes

* **cli:** add validation-app to example cli ([36a70b3](https://github.com/strongloop/loopback-next/commit/36a70b39062e3e8d467a3a820a51a58ffaefb613))
* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))


### Features

* **cli:** add `lb4 rest-crud` command to generate model endpoints from model/datasource ([38fd41e](https://github.com/strongloop/loopback-next/commit/38fd41e26cd5abf52e69d0b275a730b195be813a))





## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.1.0...@loopback/cli@2.1.1) (2020-03-17)

**Note:** Version bump only for package @loopback/cli





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.0.1...@loopback/cli@2.1.0) (2020-03-17)


### Bug Fixes

* **cli:** add ibmi, relocate db2z for affinity to other db2s ([76bb470](https://github.com/strongloop/loopback-next/commit/76bb470e8feba478796741d09b35fdb7549b79ab))
* **cli:** add missing examples to CLI ([221d8d0](https://github.com/strongloop/loopback-next/commit/221d8d00973e28475aee7771c521fd06b2723ef4))


### Features

* **cli:** add translations for 14 languages ([31bc951](https://github.com/strongloop/loopback-next/commit/31bc951c405e3bf21bc10875bc1c8cc6a1bab794))
* **example-file-upload-download:** add file download support ([12afd6b](https://github.com/strongloop/loopback-next/commit/12afd6b47ee1d371c68d03bd86c03d49b5f43b8d))
* **example-rest-crud:** add example showing CrudRestApiBuilder ([ea37afb](https://github.com/strongloop/loopback-next/commit/ea37afb8d9e4ca9aef032b84e349e918d945e8ee))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@2.0.0...@loopback/cli@2.0.1) (2020-03-05)


### Bug Fixes

* **cli:** include intl in package.json ([097724b](https://github.com/strongloop/loopback-next/commit/097724bc0d38ce6a499d2a26092a570451b5e026))





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.30.1...@loopback/cli@2.0.0) (2020-03-05)


### Bug Fixes

* remove ref for v4.loopback.io ([78f20c0](https://github.com/strongloop/loopback-next/commit/78f20c0ed4db5f3ce0d7b676449ba3b22526319e))
* **cli:** correct root directory in test ([f951052](https://github.com/strongloop/loopback-next/commit/f951052a12b82923b18f781c3b0292de0a2c8634)), closes [#4425](https://github.com/strongloop/loopback-next/issues/4425)
* **cli:** extract messages for generators ([2f572bd](https://github.com/strongloop/loopback-next/commit/2f572bd75883420e38bfaa780bc38445aec92e65))
* **cli:** extract messages for generators ([b264d60](https://github.com/strongloop/loopback-next/commit/b264d60752e8487c0649b1f47419dbc06a111384))
* **cli:** ignore stdin when config is provided via CLI args ([3d64cfe](https://github.com/strongloop/loopback-next/commit/3d64cfebe19ae26b66ae7639a8ddffbf3dd54061))
* **cli:** move `loopback` to devDependencies ([7701cab](https://github.com/strongloop/loopback-next/commit/7701cab4a18f37be62269d075045a0d0b8eb7d57))
* **cli:** update tsconfig template excludes ([1fcc463](https://github.com/strongloop/loopback-next/commit/1fcc4633af333b56d0ba978e58fbc29778861215)), closes [/github.com/strongloop/loopback-next/pull/4707#issuecomment-590255940](https://github.com//github.com/strongloop/loopback-next/pull/4707/issues/issuecomment-590255940)
* cleanup tilde-path-app post test ([4562a50](https://github.com/strongloop/loopback-next/commit/4562a5055c40ea91d33c4e1f29c08edcefa7fdef)), closes [#4652](https://github.com/strongloop/loopback-next/issues/4652)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* use [@param](https://github.com/param).filter and [@param](https://github.com/param).where decorators ([896ef74](https://github.com/strongloop/loopback-next/commit/896ef7485376b3aedcca01a40f828bf1ed9470ae))
* **cli:** add `tslib` as a template dependency ([267b074](https://github.com/strongloop/loopback-next/commit/267b074a93dc7483333486e2b381b3d7168ebc79)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* **cli:** add build:globalize option ([3c42077](https://github.com/strongloop/loopback-next/commit/3c4207730cd87e9399b18969c71515d44991e547))
* **cli:** allow different naming convention for discover ([298e66e](https://github.com/strongloop/loopback-next/commit/298e66e7430406d2615f7826c770ee126ae56d18))
* **cli:** automatically include base models when importing LB3 models ([9d5f8a7](https://github.com/strongloop/loopback-next/commit/9d5f8a771f475c1597bc5e1d22efc06e4940cbb7))
* **cli:** import LB3 models with a custom base class ([aa3dc12](https://github.com/strongloop/loopback-next/commit/aa3dc12e32bd9c297742c9b54224644ea81f7526))
* **cli:** improve logging from processing of config & options ([41a39c1](https://github.com/strongloop/loopback-next/commit/41a39c17a595bb92ea928d93318cc353e3e19218))
* **cli:** skip inherited props & settings when importing a LB3 model ([97c8b05](https://github.com/strongloop/loopback-next/commit/97c8b0535f32dc5271d84fa8b66009126ddae8e1))
* .vscode add typescript lint rules ([e8eb371](https://github.com/strongloop/loopback-next/commit/e8eb371af12ced96d0c87c88eae2be40b76c7911)), closes [#4584](https://github.com/strongloop/loopback-next/issues/4584)
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* lb3 migration tests for models customized with db metadata ([c58cc11](https://github.com/strongloop/loopback-next/commit/c58cc117b6e7a75e1920ce873a9cb4b98ff1058b))


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.30.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.30.0...@loopback/cli@1.30.1) (2020-02-06)

**Note:** Version bump only for package @loopback/cli





# [1.30.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.29.0...@loopback/cli@1.30.0) (2020-02-05)


### Features

* leverage isactive for transaction ([fc94437](https://github.com/strongloop/loopback-next/commit/fc9443787039d4a1db3008a0141f5693f95bfbd4))
* **cli:** add hasOne relation type to `lb4 relation` ([3046f3e](https://github.com/strongloop/loopback-next/commit/3046f3e9ca29225c2ca64567af0be337a6fa5b00))





# [1.29.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.28.1...@loopback/cli@1.29.0) (2020-01-27)


### Bug Fixes

* **cli:** disgard any changes if lb4 `relation` fails ([08dc87c](https://github.com/strongloop/loopback-next/commit/08dc87ca3f654f3669c5ffb130e1e4cbf0dcebef))
* **cli:** fix has many relation controller attribute ([5aa83df](https://github.com/strongloop/loopback-next/commit/5aa83df2fe3c38165174328d26726690f6cbafb5))
* **cli:** index file should be updated. Add relation interface to model template ([7fd9b88](https://github.com/strongloop/loopback-next/commit/7fd9b88626a7d1b4a227077a4334fdbd00edea0d))
* **cli:** reject datasources with no name property for service generator ([cc871e5](https://github.com/strongloop/loopback-next/commit/cc871e509b5c3a0de2ac0dc1108332285aa808a4))


### Features

* **cli:** add static BINDING_KEY prop to non-global interceptors ([5fbd95f](https://github.com/strongloop/loopback-next/commit/5fbd95f47f67207d7e0430d8c08e2a9738e685ae))





## [1.28.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.28.0...@loopback/cli@1.28.1) (2020-01-07)

**Note:** Version bump only for package @loopback/cli





# [1.28.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.27.0...@loopback/cli@1.28.0) (2020-01-07)


### Features

* add title property to ping response schema definition ([b8b7490](https://github.com/strongloop/loopback-next/commit/b8b7490ce29d0973208ba38c3365de9091b7a795))





# [1.27.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.26.0...@loopback/cli@1.27.0) (2019-12-09)


### Features

* **cli:** add default option for gracePeriodForClose to configure http/https close ([5a243e2](https://github.com/strongloop/loopback-next/commit/5a243e280868c4b83d7b5685f326a44baf5cbd9a))
* **cli:** update templates to enable esModuleInterop and default imports from non-ES modules ([83e628b](https://github.com/strongloop/loopback-next/commit/83e628bdf5834102aa9042e52a3d7e608d2d1754))





# [1.26.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.25.1...@loopback/cli@1.26.0) (2019-11-25)


### Bug Fixes

* **cli:** disconnect the datasource after the model was discovered ([ad30c61](https://github.com/strongloop/loopback-next/commit/ad30c61e8f35795bef6c2aef893884e520561832))
* **cli:** emit correct property definitions for built-in types ([6a972db](https://github.com/strongloop/loopback-next/commit/6a972db819aab9f831a26da4f2f81abe3c26efe7))
* **cli:** emit correct property definitions for built-in types ([9d34f23](https://github.com/strongloop/loopback-next/commit/9d34f23bd8eadaed9a38ca95339384bddce041b2))
* **cli:** handle missing target artifact dir ([ba34838](https://github.com/strongloop/loopback-next/commit/ba348384b045d6976e257f09cdc610766568abfa))
* **cli:** updated OAS 'Date' JS Type Mapping to 'string' ([839caa9](https://github.com/strongloop/loopback-next/commit/839caa92038d5ba8548106cd4136ee40d9abf679))


### Features

* **cli:** add `connectors.json` ([802529e](https://github.com/strongloop/loopback-next/commit/802529ed0ba1e3a9f9ef417b4b8b4a7459589682))
* use stringifyObject instead of JSON.stringify for connector metadata ([da60ee7](https://github.com/strongloop/loopback-next/commit/da60ee79d48a7ec11f510ccdbecc878e28651237))
* **cli:** add lb4 update command to check/update project dependencies ([54d1896](https://github.com/strongloop/loopback-next/commit/54d1896f63705b6938fe74ba2c21ad0b4d9bea23))
* **cli:** add the ability to check latest cli version ([869d1e4](https://github.com/strongloop/loopback-next/commit/869d1e4b19ba5483521a632a9c8af4b39ca7254f))
* **cli:** update controller template to enable filter for findById endpoint ([b0ce84b](https://github.com/strongloop/loopback-next/commit/b0ce84b79158cadf2f53bbe627da4d8196f0543f))





## [1.25.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.25.0...@loopback/cli@1.25.1) (2019-11-13)

**Note:** Version bump only for package @loopback/cli





# [1.25.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.24.0...@loopback/cli@1.25.0) (2019-11-12)


### Bug Fixes

* **cli:** improve message for model discovery code generation ([15c11d4](https://github.com/strongloop/loopback-next/commit/15c11d4b6644182b4bd5fc6be34fe805104fc3ca))
* update error message when failing to read datasource, to include filename ([6663733](https://github.com/strongloop/loopback-next/commit/6663733586ec3a98816f63a887c28b3debf51e4c)), closes [#3965](https://github.com/strongloop/loopback-next/issues/3965)


### Features

* **cli:** generate datasource json with '.config.json` extension ([51d8f7b](https://github.com/strongloop/loopback-next/commit/51d8f7b20ec59f888fd6d0634efb47d111f00ef7))
* **cli:** improve UX of multi-item selection ([077f38c](https://github.com/strongloop/loopback-next/commit/077f38ceccb2e1568aed69dbe00e298b30106c30))
* **cli:** recognize PK properties defined as `{id: 1}` ([1094509](https://github.com/strongloop/loopback-next/commit/10945093e17b260686e532804f71965d7b156606))





# [1.24.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.23.2...@loopback/cli@1.24.0) (2019-10-24)


### Bug Fixes

* **cli:** append "Service" in service generator ([c8fb805](https://github.com/strongloop/loopback-next/commit/c8fb8058c375fe22b0c64988c7ff91c1024084ed))


### Features

* **cli:** add inclusion resolver to lb4 relation ([199e1bc](https://github.com/strongloop/loopback-next/commit/199e1bc84a6c57fe650db9588bdb121d27eca7a3))





## [1.23.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.23.1...@loopback/cli@1.23.2) (2019-10-07)


### Bug Fixes

* **cli:** fix typo in cli relation tests ([466f79b](https://github.com/strongloop/loopback-next/commit/466f79b))





## [1.23.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.23.0...@loopback/cli@1.23.1) (2019-09-28)


### Bug Fixes

* **cli:** make sure properties are correctly generated ([369d58b](https://github.com/strongloop/loopback-next/commit/369d58b))





# [1.23.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.22.1...@loopback/cli@1.23.0) (2019-09-27)


### Bug Fixes

* **cli:** remove extra SPACE at EOL in help output ([aeaf793](https://github.com/strongloop/loopback-next/commit/aeaf793))


### Features

* **cli:** add new command `import-lb3-model` (EXPERIMENTAL) ([2e465e6](https://github.com/strongloop/loopback-next/commit/2e465e6))
* **cli:** print help on updating snapshots when some snapshots were not matched ([c6959b8](https://github.com/strongloop/loopback-next/commit/c6959b8))
* **cli:** write snapshot files in parallel ([a16ae34](https://github.com/strongloop/loopback-next/commit/a16ae34))





## [1.22.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.22.0...@loopback/cli@1.22.1) (2019-09-17)

**Note:** Version bump only for package @loopback/cli





# [1.22.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.6...@loopback/cli@1.22.0) (2019-09-17)


### Bug Fixes

* **cli:** exclude *.tsbuildinfo from Docker image ([581a0f3](https://github.com/strongloop/loopback-next/commit/581a0f3))
* model with id required ([270e13e](https://github.com/strongloop/loopback-next/commit/270e13e))
* **cli:** fix schema title for POST operation in relation controllers ([34a2077](https://github.com/strongloop/loopback-next/commit/34a2077))


### Features

* **cli:** add lifecycle support for datasources ([8573173](https://github.com/strongloop/loopback-next/commit/8573173))
* use descriptive title to describe schema of POST (create) request bodies ([8f49a45](https://github.com/strongloop/loopback-next/commit/8f49a45))
* **eslint-config:** enable "no-misused-promises" rule ([88d5494](https://github.com/strongloop/loopback-next/commit/88d5494))





## [1.21.6](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.5...@loopback/cli@1.21.6) (2019-09-06)

**Note:** Version bump only for package @loopback/cli





## [1.21.5](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.4...@loopback/cli@1.21.5) (2019-09-03)


### Bug Fixes

* **cli:** belongsto property generation ([82a95d4](https://github.com/strongloop/loopback-next/commit/82a95d4))





## [1.21.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.3...@loopback/cli@1.21.4) (2019-08-19)

**Note:** Version bump only for package @loopback/cli





## [1.21.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.2...@loopback/cli@1.21.3) (2019-08-15)

**Note:** Version bump only for package @loopback/cli





## [1.21.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.1...@loopback/cli@1.21.2) (2019-08-15)

**Note:** Version bump only for package @loopback/cli





## [1.21.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.21.0...@loopback/cli@1.21.1) (2019-08-15)


### Bug Fixes

* set foreignkey to be optional in the requestbody of hasmany relation ([d46ea18](https://github.com/strongloop/loopback-next/commit/d46ea18))





# [1.21.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.20.0...@loopback/cli@1.21.0) (2019-07-31)


### Bug Fixes

* add class name separation to multiple class names output ([fc79bf5](https://github.com/strongloop/loopback-next/commit/fc79bf5)), closes [#3350](https://github.com/strongloop/loopback-next/issues/3350)


### Features

* **cli:** improve `lb4 service` to generate local service classes/providers ([f743008](https://github.com/strongloop/loopback-next/commit/f743008))





# [1.20.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.19.0...@loopback/cli@1.20.0) (2019-07-26)


### Bug Fixes

* **cli:** remove -p option from eslint ([d2ffd80](https://github.com/strongloop/loopback-next/commit/d2ffd80))
* add support for excluding custom pk from POST requests ([9694d99](https://github.com/strongloop/loopback-next/commit/9694d99))


### Features

* update examples and docs to use getModelSchemaRef ([99758b1](https://github.com/strongloop/loopback-next/commit/99758b1))
* **cli:** update templates to make use of getModelSchemaRef ([4147619](https://github.com/strongloop/loopback-next/commit/4147619))
* remove openapi-v3-types package ([2a93395](https://github.com/strongloop/loopback-next/commit/2a93395))





# [1.19.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.18.0...@loopback/cli@1.19.0) (2019-07-17)


### Bug Fixes

* **cli:** app generator handles tildified project path. relevant test added ([7f7feaa](https://github.com/strongloop/loopback-next/commit/7f7feaa))
* **cli:** rearrange interceptor cli prompts ([0b2ed34](https://github.com/strongloop/loopback-next/commit/0b2ed34))
* fix conflict ([6302101](https://github.com/strongloop/loopback-next/commit/6302101))


### Features

* **cli:** modify controller templates to exclude id from POST requests ([4c1ce67](https://github.com/strongloop/loopback-next/commit/4c1ce67))
* **cli:** store original cli version in .yo.rc.json ([3b7db55](https://github.com/strongloop/loopback-next/commit/3b7db55))





# [1.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.17.2...@loopback/cli@1.18.0) (2019-06-28)


### Bug Fixes

* address violations of "no-floating-promises" rule ([0947531](https://github.com/strongloop/loopback-next/commit/0947531))


### Features

* **cli:** enable source map for npm start script ([1882240](https://github.com/strongloop/loopback-next/commit/1882240))
* **cli:** modify Controller templates to allow partial updates via PATCH ([c7c6695](https://github.com/strongloop/loopback-next/commit/c7c6695))





## [1.17.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.17.1...@loopback/cli@1.17.2) (2019-06-21)


### Bug Fixes

* **cli:** make sure tsbuildinfo is removed by the clean script ([3fdc0b1](https://github.com/strongloop/loopback-next/commit/3fdc0b1))
* **cli:** remove no-any warning from model template ([264aa28](https://github.com/strongloop/loopback-next/commit/264aa28))





## [1.17.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.17.0...@loopback/cli@1.17.1) (2019-06-20)

**Note:** Version bump only for package @loopback/cli





# [1.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.16.1...@loopback/cli@1.17.0) (2019-06-17)


### Bug Fixes

* **cli:** change class/file naming convention. Add prompt msg ([0b2a45b](https://github.com/strongloop/loopback-next/commit/0b2a45b))
* discover uses owner instead of schema ([ed588b6](https://github.com/strongloop/loopback-next/commit/ed588b6))
* remove forgotten references to tslint ([faa0a92](https://github.com/strongloop/loopback-next/commit/faa0a92))
* **cli:** discover prompt exits after generating ([8ba0dd5](https://github.com/strongloop/loopback-next/commit/8ba0dd5))


### Features

* **build:** enable incremental compilation ([2120712](https://github.com/strongloop/loopback-next/commit/2120712))





## [1.16.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.16.0...@loopback/cli@1.16.1) (2019-06-06)

**Note:** Version bump only for package @loopback/cli





# [1.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.15.1...@loopback/cli@1.16.0) (2019-06-06)


### Features

* **cli:** add lb4 interceptor command to generate interceptors ([58017b6](https://github.com/strongloop/loopback-next/commit/58017b6))





## [1.15.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.15.0...@loopback/cli@1.15.1) (2019-06-03)


### Bug Fixes

* **cli:** add eslint related dev dependencies to generated package.json ([fc18caf](https://github.com/strongloop/loopback-next/commit/fc18caf))





# [1.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.14.1...@loopback/cli@1.15.0) (2019-06-03)


### Bug Fixes

* **cli:** add type param to Filter and Where ([a9570bc](https://github.com/strongloop/loopback-next/commit/a9570bc))


### Features

* add navigational properties to find* methods ([1f0aa0b](https://github.com/strongloop/loopback-next/commit/1f0aa0b))
* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.14.0...@loopback/cli@1.14.1) (2019-05-31)


### Bug Fixes

* modelSettings is stringified properly [#2915](https://github.com/strongloop/loopback-next/issues/2915) ([84072ec](https://github.com/strongloop/loopback-next/commit/84072ec))





# [1.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.13.1...@loopback/cli@1.14.0) (2019-05-30)


### Features

* **cli:** add `lb4 relation` command ([75939a4](https://github.com/strongloop/loopback-next/commit/75939a4))





## [1.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.13.0...@loopback/cli@1.13.1) (2019-05-23)


### Bug Fixes

* **cli:** clean up template for life cycle observers ([6733610](https://github.com/strongloop/loopback-next/commit/6733610))





# [1.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.12.1...@loopback/cli@1.13.0) (2019-05-14)


### Features

* add lb3 application ([bf60011](https://github.com/strongloop/loopback-next/commit/bf60011))





## [1.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.12.0...@loopback/cli@1.12.1) (2019-05-10)

**Note:** Version bump only for package @loopback/cli





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.11.3...@loopback/cli@1.12.0) (2019-05-09)


### Features

* **cli:** improve scaffolding of complex model settings ([5035c63](https://github.com/strongloop/loopback-next/commit/5035c63))





## [1.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.11.2...@loopback/cli@1.11.3) (2019-05-06)

**Note:** Version bump only for package @loopback/cli





## [1.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.11.1...@loopback/cli@1.11.2) (2019-04-26)


### Bug Fixes

* **cli:** escape char sequences for javascript comments ([83ff105](https://github.com/strongloop/loopback-next/commit/83ff105))
* **cli:** escape identifiers with conflicting name as decorators ([6d71439](https://github.com/strongloop/loopback-next/commit/6d71439))





## [1.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.11.0...@loopback/cli@1.11.1) (2019-04-20)


### Bug Fixes

* **cli:** keep or escape property names for models ([cb308ad](https://github.com/strongloop/loopback-next/commit/cb308ad))





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.10.0...@loopback/cli@1.11.0) (2019-04-11)


### Bug Fixes

* **cli:** generate operation only for the 1st tag to avoid duplicate routes ([4843a1f](https://github.com/strongloop/loopback-next/commit/4843a1f))
* **cli:** improve openapi code generation for naming and typing ([af20548](https://github.com/strongloop/loopback-next/commit/af20548))


### Features

* **cli:** add lb4 discover for model discovery ([35f719c](https://github.com/strongloop/loopback-next/commit/35f719c))
* **cli:** normalize variable names for OpenAPI paths ([a3d0dfc](https://github.com/strongloop/loopback-next/commit/a3d0dfc))





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.9.0...@loopback/cli@1.10.0) (2019-04-09)


### Bug Fixes

* **cli:** make sure the item type is imported for an array in openapi spec ([91b2381](https://github.com/strongloop/loopback-next/commit/91b2381))


### Features

* **cli:** add `lb4 observer` command to generate life cycle scripts ([d54651d](https://github.com/strongloop/loopback-next/commit/d54651d))





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.8.4...@loopback/cli@1.9.0) (2019-04-05)


### Features

* add greeter-extension example ([9b09298](https://github.com/strongloop/loopback-next/commit/9b09298))





## [1.8.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.8.3...@loopback/cli@1.8.4) (2019-03-22)

**Note:** Version bump only for package @loopback/cli





## [1.8.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.8.2...@loopback/cli@1.8.3) (2019-03-22)


### Bug Fixes

* **build:** remove "dom" from the list of global libraries ([781cd1d](https://github.com/strongloop/loopback-next/commit/781cd1d))





## [1.8.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.8.1...@loopback/cli@1.8.2) (2019-03-12)


### Bug Fixes

* **cli:** setup controller generator after adding properties ([b0ee417](https://github.com/strongloop/loopback-next/commit/b0ee417))
* **cli:** simplify HTTP server setup in acceptance tests ([aa0e2f7](https://github.com/strongloop/loopback-next/commit/aa0e2f7))
* **cli:** use pascalCase for toClassName to handle '-' ([861256c](https://github.com/strongloop/loopback-next/commit/861256c))


### Performance Improvements

* update dockerfile to better version ([5494243](https://github.com/strongloop/loopback-next/commit/5494243))





## [1.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.8.0...@loopback/cli@1.8.1) (2019-03-01)

**Note:** Version bump only for package @loopback/cli





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.7.0...@loopback/cli@1.8.0) (2019-03-01)


### Bug Fixes

* **cli:** fix prompt for base repository class ([b429729](https://github.com/strongloop/loopback-next/commit/b429729)), closes [#2429](https://github.com/strongloop/loopback-next/issues/2429)


### Features

* add express example ([dd2400e](https://github.com/strongloop/loopback-next/commit/dd2400e))





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.6.0...@loopback/cli@1.7.0) (2019-02-25)


### Bug Fixes

* **cli:** do not install deps for built-in connectors ([2e035a5](https://github.com/strongloop/loopback-next/commit/2e035a5))
* update version of nyc ([f8db27c](https://github.com/strongloop/loopback-next/commit/f8db27c))
* **cli:** force test host to be HOST env var or ipv4 interface ([1664d4f](https://github.com/strongloop/loopback-next/commit/1664d4f))
* **cli:** generate property.array for array of simple types ([ec80d9a](https://github.com/strongloop/loopback-next/commit/ec80d9a))


### Features

* **cli:** add `--docker` option to generate docker files ([4cd2442](https://github.com/strongloop/loopback-next/commit/4cd2442))





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.5.2...@loopback/cli@1.6.0) (2019-02-08)


### Bug Fixes

* remove unused juggler import ([0121c10](https://github.com/strongloop/loopback-next/commit/0121c10))
* update to the most recent lodash version ([65ee865](https://github.com/strongloop/loopback-next/commit/65ee865))


### Features

* **cli:** scaffold test files to `src/__tests__` ([d3a3bea](https://github.com/strongloop/loopback-next/commit/d3a3bea))
* **cli:** use a custom repository base class ([edbbe88](https://github.com/strongloop/loopback-next/commit/edbbe88))





## [1.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.5.1...@loopback/cli@1.5.2) (2019-01-28)


### Bug Fixes

* **cli:** add fs-extra dependency as it's used by lb example ([3c74ffa](https://github.com/strongloop/loopback-next/commit/3c74ffa))
* **cli:** allow base class exist for model config option ([9605ed1](https://github.com/strongloop/loopback-next/commit/9605ed1))





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.5.0...@loopback/cli@1.5.1) (2019-01-15)


### Bug Fixes

* **cli:** change enable setting check ([f4a9dc0](https://github.com/strongloop/loopback-next/commit/f4a9dc0))





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.4.0...@loopback/cli@1.5.0) (2019-01-14)


### Bug Fixes

* **cli:** add descriptions to features ([8a94f8f](https://github.com/strongloop/loopback-next/commit/8a94f8f))
* **cli:** remove license header from test code template ([1fd35f4](https://github.com/strongloop/loopback-next/commit/1fd35f4))


### Features

* always include tslint and typescript in project dev-dependencies ([e0df285](https://github.com/strongloop/loopback-next/commit/e0df285))
* use dependency instead of keyword to check loopback projects ([bb6ee51](https://github.com/strongloop/loopback-next/commit/bb6ee51))
* **cli:** add property modelSettings ([e0f75ac](https://github.com/strongloop/loopback-next/commit/e0f75ac))
* **cli:** add strict prompt to model generator ([a68d78b](https://github.com/strongloop/loopback-next/commit/a68d78b))





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.3.0...@loopback/cli@1.4.0) (2018-12-20)


### Bug Fixes

* **cli:** set `required: true` in property decoration for openapi ([3c37286](https://github.com/strongloop/loopback-next/commit/3c37286))


### Features

* **cli:** new projects load tslint config from `[@loopback](https://github.com/loopback)/tslint-config` ([5b9c329](https://github.com/strongloop/loopback-next/commit/5b9c329))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.2.2...@loopback/cli@1.3.0) (2018-12-13)


### Bug Fixes

* add model/entity descriptions ([8156f9d](https://github.com/strongloop/loopback-next/commit/8156f9d))
* **cli:** add missing PUT method in rest controller template ([8394c74](https://github.com/strongloop/loopback-next/commit/8394c74))
* change service generator ds to uppercase ([83840a3](https://github.com/strongloop/loopback-next/commit/83840a3))


### Features

* scaffold DB migration script for new app projects ([f783f07](https://github.com/strongloop/loopback-next/commit/f783f07))
* **cli:** allow annonymous schemas in openapi to be mapped to models ([eedec1e](https://github.com/strongloop/loopback-next/commit/eedec1e))





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.2.1...@loopback/cli@1.2.2) (2018-11-26)

**Note:** Version bump only for package @loopback/cli





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.2.0...@loopback/cli@1.2.1) (2018-11-17)

**Note:** Version bump only for package @loopback/cli





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.1.1...@loopback/cli@1.2.0) (2018-11-17)


### Bug Fixes

* **cli:** allow `*` for version range ([0a42541](https://github.com/strongloop/loopback-next/commit/0a42541))


### Features

* an extension adding a self-hosted REST API Explorer ([4c165c7](https://github.com/strongloop/loopback-next/commit/4c165c7))





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.1.0...@loopback/cli@1.1.1) (2018-11-14)

**Note:** Version bump only for package @loopback/cli





<a name="1.1.0"></a>
# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.0.1...@loopback/cli@1.1.0) (2018-11-08)


### Bug Fixes

* change unmatched html tags, remove redundant 'px' from 0 ([46d08f6](https://github.com/strongloop/loopback-next/commit/46d08f6))
* **cli:** allow other connectors to be used for repositories ([9a0d9a8](https://github.com/strongloop/loopback-next/commit/9a0d9a8))
* update usage of `x-ts-type` for schemas ([57c694e](https://github.com/strongloop/loopback-next/commit/57c694e))
* **cli:** set glob options to support windows paths with special chars ([9a84ef0](https://github.com/strongloop/loopback-next/commit/9a84ef0))


### Features

* **cli:** use app.static for default home page ([1dcf169](https://github.com/strongloop/loopback-next/commit/1dcf169))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@1.0.0...@loopback/cli@1.0.1) (2018-10-17)


### Bug Fixes

* **cli:** add more exit checks to fail fast ([90c4406](https://github.com/strongloop/loopback-next/commit/90c4406))





<a name="0.31.0"></a>
# [0.31.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.30.0...@loopback/cli@0.31.0) (2018-10-08)


### Features

* use resolveJsonModule to load datasource config ([73e19ff](https://github.com/strongloop/loopback-next/commit/73e19ff))





<a name="0.30.0"></a>
# [0.30.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.29.0...@loopback/cli@0.30.0) (2018-10-06)


### Bug Fixes

* **cli:** generate matching arg names for repository constructors ([190fbf3](https://github.com/strongloop/loopback-next/commit/190fbf3))
* **cli:** remove dist-util from project templates ([f6c3048](https://github.com/strongloop/loopback-next/commit/f6c3048))


### Features

* deprecate dist-util package ([91a343c](https://github.com/strongloop/loopback-next/commit/91a343c))





<a name="0.29.0"></a>
# [0.29.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.28.0...@loopback/cli@0.29.0) (2018-10-05)


### Features

* **cli:** add lb4 model option to select base model class ([4c0ce80](https://github.com/strongloop/loopback-next/commit/4c0ce80)), closes [#1698](https://github.com/strongloop/loopback-next/issues/1698)





<a name="0.28.0"></a>
# [0.28.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.27.0...@loopback/cli@0.28.0) (2018-10-03)


### Bug Fixes

* **cli:** fixed ds names that were hyphened ([568307c](https://github.com/strongloop/loopback-next/commit/568307c)), closes [#1791](https://github.com/strongloop/loopback-next/issues/1791)
* clean up dataSource usage ([69506a4](https://github.com/strongloop/loopback-next/commit/69506a4))


### Features

* **cli:** check project deps against cli template ([8d056c4](https://github.com/strongloop/loopback-next/commit/8d056c4))





<a name="0.27.0"></a>
# [0.27.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.26.0...@loopback/cli@0.27.0) (2018-09-28)


### Bug Fixes

* **cli:** fixes final datasource class name on repository and service ([d0994af](https://github.com/strongloop/loopback-next/commit/d0994af)), closes [#1771](https://github.com/strongloop/loopback-next/issues/1771)


### Features

* **cli:** add code template for default home page controller ([f4be330](https://github.com/strongloop/loopback-next/commit/f4be330))
* **repository:** return an object for count and updateAll ([c146366](https://github.com/strongloop/loopback-next/commit/c146366))





<a name="0.26.0"></a>
# [0.26.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.25.0...@loopback/cli@0.26.0) (2018-09-27)


### Bug Fixes

* **cli:** datasource class being referenced in generators ([6d345f7](https://github.com/strongloop/loopback-next/commit/6d345f7))


### Features

* **cli:** add basic scaffolding for lb4 service ([bed83b3](https://github.com/strongloop/loopback-next/commit/bed83b3))
* **cli:** add integration tests for lb4 service ([3731f5b](https://github.com/strongloop/loopback-next/commit/3731f5b))
* **cli:** change location fixtures service/repository ([d4f5b5c](https://github.com/strongloop/loopback-next/commit/d4f5b5c))
* **cli:** lb4 service install service-proxy if missing ([b086d2d](https://github.com/strongloop/loopback-next/commit/b086d2d))
* **cli:** lb4 service/repository shared scaffold ([9bafc6d](https://github.com/strongloop/loopback-next/commit/9bafc6d))





<a name="0.25.0"></a>
# [0.25.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.24.0...@loopback/cli@0.25.0) (2018-09-25)


### Features

* add "filter" parameter to "find" endpoints ([7e1acfc](https://github.com/strongloop/loopback-next/commit/7e1acfc))
* **cli:** add responses for PingController.ping() ([ec52b89](https://github.com/strongloop/loopback-next/commit/ec52b89))





<a name="0.24.0"></a>
# [0.24.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.23.0...@loopback/cli@0.24.0) (2018-09-21)


### Bug Fixes

* **cli:** removed unused dependencies from project template ([3907df4](https://github.com/strongloop/loopback-next/commit/3907df4))


### Features

* **cli:** add update notifier to remind cli upgrade ([61255cc](https://github.com/strongloop/loopback-next/commit/61255cc))
* **testlab:** add createRestAppClient(), simplify usage in tests ([d75be77](https://github.com/strongloop/loopback-next/commit/d75be77))
* **testlab:** set port to 0 in givenHttpServerConfig ([90a0bfb](https://github.com/strongloop/loopback-next/commit/90a0bfb))





<a name="0.23.0"></a>
# [0.23.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.11...@loopback/cli@0.23.0) (2018-09-19)


### Features

* **cli:** add lb4 repository feature ([0397c04](https://github.com/strongloop/loopback-next/commit/0397c04)), closes [#1588](https://github.com/strongloop/loopback-next/issues/1588)
* **cli:** add test for multiple repositories ([6e6faad](https://github.com/strongloop/loopback-next/commit/6e6faad))
* **cli:** add util shared functions and constants ([26915e5](https://github.com/strongloop/loopback-next/commit/26915e5))
* **cli:** ast-helper integration ([99a0bad](https://github.com/strongloop/loopback-next/commit/99a0bad))
* **cli:** change msg when no datasource or repository exists ([739676b](https://github.com/strongloop/loopback-next/commit/739676b))
* **repository:** rework *ById methods to throw if id not found ([264f231](https://github.com/strongloop/loopback-next/commit/264f231))





<a name="0.22.11"></a>
## [0.22.11](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.10...@loopback/cli@0.22.11) (2018-09-17)


### Bug Fixes

* **cli:** generate correct index.js without loopback build ([1c8cb3e](https://github.com/strongloop/loopback-next/commit/1c8cb3e))
* **cli:** use rimraf to replace rm -rf ([479f363](https://github.com/strongloop/loopback-next/commit/479f363))





<a name="0.22.10"></a>
## [0.22.10](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.9...@loopback/cli@0.22.10) (2018-09-14)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.9"></a>
## [0.22.9](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.8...@loopback/cli@0.22.9) (2018-09-14)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.8"></a>
## [0.22.8](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.7...@loopback/cli@0.22.8) (2018-09-14)


### Bug Fixes

* **cli:** enforce an empty object on connectors without settings property ([111442b](https://github.com/strongloop/loopback-next/commit/111442b)), closes [#1697](https://github.com/strongloop/loopback-next/issues/1697)
* **cli:** git-ignore all "dist*" dirs in scaffolded projects ([1cab517](https://github.com/strongloop/loopback-next/commit/1cab517))
* **cli:** update template with responses object ([a2bbbc9](https://github.com/strongloop/loopback-next/commit/a2bbbc9))





<a name="0.22.7"></a>
## [0.22.7](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.6...@loopback/cli@0.22.7) (2018-09-12)


### Bug Fixes

* make `lb model` prompts clearer ([2ec4d2f](https://github.com/strongloop/loopback-next/commit/2ec4d2f))





<a name="0.22.6"></a>
## [0.22.6](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.5...@loopback/cli@0.22.6) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.5"></a>
## [0.22.5](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.3...@loopback/cli@0.22.5) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.4"></a>
## [0.22.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.3...@loopback/cli@0.22.4) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.3"></a>
## [0.22.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.2...@loopback/cli@0.22.3) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.2"></a>
## [0.22.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.1...@loopback/cli@0.22.2) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.1"></a>
## [0.22.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.22.0...@loopback/cli@0.22.1) (2018-09-10)

**Note:** Version bump only for package @loopback/cli





<a name="0.22.0"></a>
# [0.22.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.21.4...@loopback/cli@0.22.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/strongloop/loopback-next/commit/35b916b))
* **cli:** rename repository/service feature flags ([c089299](https://github.com/strongloop/loopback-next/commit/c089299))


### Features

* **service-proxy:** add service mixin ([fb01931](https://github.com/strongloop/loopback-next/commit/fb01931))





<a name="0.21.4"></a>
## [0.21.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.21.3...@loopback/cli@0.21.4) (2018-08-25)

**Note:** Version bump only for package @loopback/cli





<a name="0.21.3"></a>
## [0.21.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.21.2...@loopback/cli@0.21.3) (2018-08-24)


### Bug Fixes

* **cli:** tweaks to templates ([6f1d7bb](https://github.com/strongloop/loopback-next/commit/6f1d7bb))





<a name="0.21.2"></a>
## [0.21.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.21.1...@loopback/cli@0.21.2) (2018-08-20)


### Bug Fixes

* **cli:** add esnext.asynciterable to lib for typescript ([83a8036](https://github.com/strongloop/loopback-next/commit/83a8036))
* **cli:** increase timeout for app generation tests ([c51383d](https://github.com/strongloop/loopback-next/commit/c51383d))




<a name="0.21.1"></a>
## [0.21.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.21.0...@loopback/cli@0.21.1) (2018-08-15)


### Bug Fixes

* **repository:** change the way array property definition is built for the juggler ([2471c88](https://github.com/strongloop/loopback-next/commit/2471c88))




<a name="0.21.0"></a>
# [0.21.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.20.2...@loopback/cli@0.21.0) (2018-08-08)


### Bug Fixes

* import package in template ([14bb6a5](https://github.com/strongloop/loopback-next/commit/14bb6a5))
* **cli:** change model template to properly render array types ([2d43a61](https://github.com/strongloop/loopback-next/commit/2d43a61))
* **cli:** install dependencies for clones examples ([5774f1f](https://github.com/strongloop/loopback-next/commit/5774f1f))
* **cli:** remove deleteAll endpoint from REST Controller template ([34eba34](https://github.com/strongloop/loopback-next/commit/34eba34))
* **cli:** use this.exit instead of throwing an error ([8d25a79](https://github.com/strongloop/loopback-next/commit/8d25a79))


### Features

* **cli:** add repositorymixin and imports by a new switch ([be81131](https://github.com/strongloop/loopback-next/commit/be81131)), closes [#1594](https://github.com/strongloop/loopback-next/issues/1594)
* **cli:** use `app.restServer.url` for console logs ([f31160c](https://github.com/strongloop/loopback-next/commit/f31160c))
* **example-soap-calculator:** add soap web services integration example ([9a8d57c](https://github.com/strongloop/loopback-next/commit/9a8d57c)), closes [#1550](https://github.com/strongloop/loopback-next/issues/1550)




<a name="0.20.2"></a>
## [0.20.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.20.1...@loopback/cli@0.20.2) (2018-07-21)




**Note:** Version bump only for package @loopback/cli

<a name="0.20.1"></a>
## [0.20.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.20.0...@loopback/cli@0.20.1) (2018-07-20)




**Note:** Version bump only for package @loopback/cli

<a name="0.20.0"></a>
# [0.20.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.19.0...@loopback/cli@0.20.0) (2018-07-20)


### Bug Fixes

* **cli:** fix cli rest controller generator template ([cc9591d](https://github.com/strongloop/loopback-next/commit/cc9591d))


### Features

* **example-todo-list:** add TodoList package/tutorial ([306d437](https://github.com/strongloop/loopback-next/commit/306d437))




<a name="0.19.0"></a>
# [0.19.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.18.1...@loopback/cli@0.19.0) (2018-07-13)


### Bug Fixes

* **cli:** add empty logs to better format model prompts ([60b3d57](https://github.com/strongloop/loopback-next/commit/60b3d57))
* **cli:** adds the <idtype> on param.path for those methods in the rest controller template parsing ([c526b99](https://github.com/strongloop/loopback-next/commit/c526b99))
* **cli:** reorder where and body in CLI template for updateAll and make where optional ([c875707](https://github.com/strongloop/loopback-next/commit/c875707))
* **cli:** support updating multiple index.ts files ([1e92f4f](https://github.com/strongloop/loopback-next/commit/1e92f4f))


### Features

* **cli:** `lb4 model` command to scaffold model files ([3593820](https://github.com/strongloop/loopback-next/commit/3593820))




<a name="0.18.1"></a>
## [0.18.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.18.0...@loopback/cli@0.18.1) (2018-07-11)




**Note:** Version bump only for package @loopback/cli

<a name="0.18.0"></a>
# [0.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.17.0...@loopback/cli@0.18.0) (2018-07-10)


### Bug Fixes

* **cli:** install deps if necessary for datasource ([4c605b0](https://github.com/strongloop/loopback-next/commit/4c605b0))


### Features

* **cli:** add --format to run lint:fix for generated code ([77f15c7](https://github.com/strongloop/loopback-next/commit/77f15c7))




<a name="0.17.0"></a>
# [0.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.16.3...@loopback/cli@0.17.0) (2018-07-09)


### Bug Fixes

* **cli:** tweak getArtifactList to return pascalCased strings ([b3bb208](https://github.com/strongloop/loopback-next/commit/b3bb208))


### Features

* **cli:** add comments for generated methods from openapi ([daa7f78](https://github.com/strongloop/loopback-next/commit/daa7f78))
* **cli:** add config and yes options ([5778a2a](https://github.com/strongloop/loopback-next/commit/5778a2a))
* **cli:** improve openapi handling of body and impl ([640b941](https://github.com/strongloop/loopback-next/commit/640b941))




<a name="0.16.3"></a>
## [0.16.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.16.2...@loopback/cli@0.16.3) (2018-06-28)




**Note:** Version bump only for package @loopback/cli

<a name="0.16.2"></a>
## [0.16.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.16.1...@loopback/cli@0.16.2) (2018-06-27)




**Note:** Version bump only for package @loopback/cli

<a name="0.16.1"></a>
## [0.16.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.16.0...@loopback/cli@0.16.1) (2018-06-26)


### Bug Fixes

* **cli:** allow path level parameters for openapi ([55b041a](https://github.com/strongloop/loopback-next/commit/55b041a))




<a name="0.16.0"></a>
# [0.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.14.0...@loopback/cli@0.16.0) (2018-06-25)


### Features

* **cli:** add cli for code generation from openapi ([1a1b12c](https://github.com/strongloop/loopback-next/commit/1a1b12c))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.14.0...@loopback/cli@0.15.0) (2018-06-25)


### Features

* **cli:** add cli for code generation from openapi ([1a1b12c](https://github.com/strongloop/loopback-next/commit/1a1b12c))




<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.6...@loopback/cli@0.14.0) (2018-06-20)


### Bug Fixes

* **cli:** make download-connector-list more robust ([a4c2ce0](https://github.com/strongloop/loopback-next/commit/a4c2ce0))
* **cli:** update successful creation message ([d602ded](https://github.com/strongloop/loopback-next/commit/d602ded)), closes [#886](https://github.com/strongloop/loopback-next/issues/886)


### Features

* **cli:** add lb4 datasource command ([b3844eb](https://github.com/strongloop/loopback-next/commit/b3844eb))




<a name="0.13.6"></a>
## [0.13.6](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.5...@loopback/cli@0.13.6) (2018-06-11)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.5"></a>
## [0.13.5](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.4...@loopback/cli@0.13.5) (2018-06-09)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.4"></a>
## [0.13.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.3...@loopback/cli@0.13.4) (2018-06-09)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.3"></a>
## [0.13.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.1...@loopback/cli@0.13.3) (2018-06-09)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.2"></a>
## [0.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.1...@loopback/cli@0.13.2) (2018-06-09)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.13.0...@loopback/cli@0.13.1) (2018-06-08)




**Note:** Version bump only for package @loopback/cli

<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.12.1...@loopback/cli@0.13.0) (2018-06-08)


### Bug Fixes

* **cli:** fix controller.integration.js tests and refactor ([f3edbd9](https://github.com/strongloop/loopback-next/commit/f3edbd9))
* **cli:** fix templates & move some utils to base generator ([1a5cbf8](https://github.com/strongloop/loopback-next/commit/1a5cbf8))
* **cli:** make sure --applicationName is honored ([526e6ca](https://github.com/strongloop/loopback-next/commit/526e6ca))


### Features

* **cli:** add vscode config files ([3738b9c](https://github.com/strongloop/loopback-next/commit/3738b9c))
* **cli:** auto-generate / update index.ts for exports ([2998363](https://github.com/strongloop/loopback-next/commit/2998363)), closes [#1127](https://github.com/strongloop/loopback-next/issues/1127)




<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.12.0...@loopback/cli@0.12.1) (2018-05-28)




**Note:** Version bump only for package @loopback/cli

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.6...@loopback/cli@0.12.0) (2018-05-23)


### Features

* **cli:** add CLI prompt for controller's http path name ([0f9c438](https://github.com/strongloop/loopback-next/commit/0f9c438))




<a name="0.11.6"></a>
## [0.11.6](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.5...@loopback/cli@0.11.6) (2018-05-20)


### Bug Fixes

* replace gulp-rename with our own implementation ([f8349d4](https://github.com/strongloop/loopback-next/commit/f8349d4))




<a name="0.11.5"></a>
## [0.11.5](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.4...@loopback/cli@0.11.5) (2018-05-14)




**Note:** Version bump only for package @loopback/cli

<a name="0.11.4"></a>
## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.3...@loopback/cli@0.11.4) (2018-05-14)




**Note:** Version bump only for package @loopback/cli

<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.2...@loopback/cli@0.11.3) (2018-05-08)




**Note:** Version bump only for package @loopback/cli

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.1...@loopback/cli@0.11.2) (2018-05-03)




**Note:** Version bump only for package @loopback/cli

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.11.0...@loopback/cli@0.11.1) (2018-05-03)




**Note:** Version bump only for package @loopback/cli

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.9.2...@loopback/cli@0.11.0) (2018-05-03)


### Features

* **cli:** download examples via npm ([43383f5](https://github.com/strongloop/loopback-next/commit/43383f5))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.9.2...@loopback/cli@0.10.0) (2018-05-03)


### Features

* **cli:** download examples via npm ([43383f5](https://github.com/strongloop/loopback-next/commit/43383f5))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.2"></a>
## [0.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.9.1...@loopback/cli@0.9.2) (2018-04-26)




**Note:** Version bump only for package @loopback/cli

<a name="0.9.1"></a>
## [0.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.9.0...@loopback/cli@0.9.1) (2018-04-26)




**Note:** Version bump only for package @loopback/cli

<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.8.0...@loopback/cli@0.9.0) (2018-04-25)


### Features

* **cli:** improve cli help/version/commands options ([715cc91](https://github.com/strongloop/loopback-next/commit/715cc91))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.7.4...@loopback/cli@0.8.0) (2018-04-16)




**Note:** Version bump only for package @loopback/cli

<a name="0.7.4"></a>
## [0.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.7.3...@loopback/cli@0.7.4) (2018-04-16)




**Note:** Version bump only for package @loopback/cli

<a name="0.7.3"></a>
## [0.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.7.1...@loopback/cli@0.7.3) (2018-04-12)




**Note:** Version bump only for package @loopback/cli

<a name="0.7.2"></a>
## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.7.1...@loopback/cli@0.7.2) (2018-04-12)




**Note:** Version bump only for package @loopback/cli

<a name="0.7.1"></a>
## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.7.0...@loopback/cli@0.7.1) (2018-04-11)




**Note:** Version bump only for package @loopback/cli

<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.6.2...@loopback/cli@0.7.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))
* **repository:** have [@repository](https://github.com/repository) take in constructor as arg ([3db07eb](https://github.com/strongloop/loopback-next/commit/3db07eb))




<a name="0.6.3"></a>
## [0.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.6.2...@loopback/cli@0.6.3) (2018-04-06)




**Note:** Version bump only for package @loopback/cli

<a name="0.6.2"></a>
## [0.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.6.1...@loopback/cli@0.6.2) (2018-04-04)




**Note:** Version bump only for package @loopback/cli

<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.6.0...@loopback/cli@0.6.1) (2018-04-02)




**Note:** Version bump only for package @loopback/cli

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.5.2...@loopback/cli@0.6.0) (2018-03-29)


### Bug Fixes

* **cli:** exit gracefully if the project name fails validation ([dfdf090](https://github.com/strongloop/loopback-next/commit/dfdf090))
* **cli:** remove automatic license generation ([537ff86](https://github.com/strongloop/loopback-next/commit/537ff86))


### Code Refactoring

* renamed example-getting-started to example-todo ([7a09f1b](https://github.com/strongloop/loopback-next/commit/7a09f1b))


### BREAKING CHANGES

* example-getting-started is now example-todo




<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.5.1...@loopback/cli@0.5.2) (2018-03-23)




**Note:** Version bump only for package @loopback/cli

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.5.0...@loopback/cli@0.5.1) (2018-03-21)




**Note:** Version bump only for package @loopback/cli

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.4.3...@loopback/cli@0.5.0) (2018-03-21)


### Bug Fixes

* **cli:** update tsconfig.json to include index.ts ([dc5107c](https://github.com/strongloop/loopback-next/commit/dc5107c))


### Features

* **rest:** expose app.requestHandler function ([20a41ac](https://github.com/strongloop/loopback-next/commit/20a41ac))


### BREAKING CHANGES

* **rest:** `RestServer#handleHttp` was renamed to
`RestServer#requestHandler`.




<a name="0.4.3"></a>
## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.4.2...@loopback/cli@0.4.3) (2018-03-14)




**Note:** Version bump only for package @loopback/cli

<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.4.1...@loopback/cli@0.4.2) (2018-03-13)




**Note:** Version bump only for package @loopback/cli

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.4.0...@loopback/cli@0.4.1) (2018-03-08)




**Note:** Version bump only for package @loopback/cli

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.3.1...@loopback/cli@0.4.0) (2018-03-08)


### Bug Fixes

* clean up the app run test ([c0d3731](https://github.com/strongloop/loopback-next/commit/c0d3731))
* **cli:** add `--allow-console-logs` to app npm test script ([5823a18](https://github.com/strongloop/loopback-next/commit/5823a18))
* template ([cf9cf04](https://github.com/strongloop/loopback-next/commit/cf9cf04))


### Features

* add private option for project generartion ([5c42be4](https://github.com/strongloop/loopback-next/commit/5c42be4))
* **build:** use options to control cli/shell run ([c4e8bce](https://github.com/strongloop/loopback-next/commit/c4e8bce))




<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.3.0...@loopback/cli@0.3.1) (2018-03-07)


### Bug Fixes

* fix typo ([6ecc13c](https://github.com/strongloop/loopback-next/commit/6ecc13c))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.2.0...@loopback/cli@0.3.0) (2018-03-06)


### Bug Fixes

* use lerna to collect versions for loopback modules ([2956bf9](https://github.com/strongloop/loopback-next/commit/2956bf9))


### Features

* **cli:** replace hard-coded loopback module version in templates ([0a742d7](https://github.com/strongloop/loopback-next/commit/0a742d7))
* upgrade from swagger 2 to openapi 3 ([71e5af1](https://github.com/strongloop/loopback-next/commit/71e5af1))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.1.3...@loopback/cli@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/cli

<a name="0.1.3"></a>
## [0.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.1.2...@loopback/cli@0.1.3) (2018-03-01)


### Bug Fixes

* **cli:** move sequence customization to app constructor ([4ee3429](https://github.com/strongloop/loopback-next/commit/4ee3429))




<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.1.1...@loopback/cli@0.1.2) (2018-02-23)




**Note:** Version bump only for package @loopback/cli

<a name="0.1.1"></a>
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/cli@0.1.0...@loopback/cli@0.1.1) (2018-02-21)


### Bug Fixes

* **cli:** fix app templates with boot and sequence ([81272e8](https://github.com/strongloop/loopback-next/commit/81272e8))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.23...@loopback/cli@0.1.0) (2018-02-21)


### Features

* [@loopback](https://github.com/loopback)/boot ([#858](https://github.com/strongloop/loopback-next/issues/858)) ([c2ca8be](https://github.com/strongloop/loopback-next/commit/c2ca8be))




<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.22...@loopback/cli@4.0.0-alpha.23) (2018-02-15)


### Bug Fixes

* **cli:** remove copyright header from generated app ([#991](https://github.com/strongloop/loopback-next/issues/991)) ([c987b28](https://github.com/strongloop/loopback-next/commit/c987b28)), closes [#944](https://github.com/strongloop/loopback-next/issues/944)


### Features

* **cli:** switch .template to .ejs ([#996](https://github.com/strongloop/loopback-next/issues/996)) ([a27e856](https://github.com/strongloop/loopback-next/commit/a27e856))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.21...@loopback/cli@4.0.0-alpha.22) (2018-02-07)


### Bug Fixes

* **build:** fix tslint config and slipped violations ([22f8e05](https://github.com/strongloop/loopback-next/commit/22f8e05))


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.20...@loopback/cli@4.0.0-alpha.21) (2018-02-04)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.19...@loopback/cli@4.0.0-alpha.20) (2018-01-30)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.18...@loopback/cli@4.0.0-alpha.19) (2018-01-29)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.17...@loopback/cli@4.0.0-alpha.18) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))


### Features

* **testlab:** create a test sandbox utility ([#877](https://github.com/strongloop/loopback-next/issues/877)) ([9526ba3](https://github.com/strongloop/loopback-next/commit/9526ba3))




<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.16...@loopback/cli@4.0.0-alpha.17) (2018-01-19)


### Bug Fixes

* **cli:** rework template to use inline param decoration ([e3ef86b](https://github.com/strongloop/loopback-next/commit/e3ef86b))


### Features

* **cli:** generate REST controller with CRUD methods ([57fe858](https://github.com/strongloop/loopback-next/commit/57fe858))
* **cli:** lb4 example [<example-name>] ([4286c0d](https://github.com/strongloop/loopback-next/commit/4286c0d))
* **example-getting-started:** migrate into monorepo ([9478d8b](https://github.com/strongloop/loopback-next/commit/9478d8b))




<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.15...@loopback/cli@4.0.0-alpha.16) (2018-01-11)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.14...@loopback/cli@4.0.0-alpha.15) (2018-01-03)


### Bug Fixes

* add new openapi package ([#829](https://github.com/strongloop/loopback-next/issues/829)) ([dac9320](https://github.com/strongloop/loopback-next/commit/dac9320))




<a name="4.0.0-alpha.14"></a>
# [4.0.0-alpha.14](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.13...@loopback/cli@4.0.0-alpha.14) (2018-01-03)


### Features

* **cli:** add scoped debug function ([8535c5e](https://github.com/strongloop/loopback-next/commit/8535c5e))




<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.12...@loopback/cli@4.0.0-alpha.13) (2017-12-21)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.11...@loopback/cli@4.0.0-alpha.12) (2017-12-11)


### Features

* **cli:** Cleanup REST application tooling ([#774](https://github.com/strongloop/loopback-next/issues/774)) ([dc50ed8](https://github.com/strongloop/loopback-next/commit/dc50ed8))




<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.10...@loopback/cli@4.0.0-alpha.11) (2017-12-01)


### Bug Fixes

* **cli:** use prerelease versioning for templates ([81aaa6f](https://github.com/strongloop/loopback-next/commit/81aaa6f))




<a name="4.0.0-alpha.10"></a>
# [4.0.0-alpha.10](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.9...@loopback/cli@4.0.0-alpha.10) (2017-12-01)


### Features

* Add exit() to abort generation ([c95aa23](https://github.com/strongloop/loopback-next/commit/c95aa23))




<a name="4.0.0-alpha.9"></a>
# [4.0.0-alpha.9](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.8...@loopback/cli@4.0.0-alpha.9) (2017-12-01)


### Features

* **cli:** remove default option for controller ([#768](https://github.com/strongloop/loopback-next/issues/768)) ([cc41fd6](https://github.com/strongloop/loopback-next/commit/cc41fd6))




<a name="4.0.0-alpha.8"></a>
# [4.0.0-alpha.8](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.7...@loopback/cli@4.0.0-alpha.8) (2017-11-30)


### Features

* **cli:** Tooling for empty controller ([#762](https://github.com/strongloop/loopback-next/issues/762)) ([14e7897](https://github.com/strongloop/loopback-next/commit/14e7897))




<a name="4.0.0-alpha.7"></a>
# [4.0.0-alpha.7](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.6...@loopback/cli@4.0.0-alpha.7) (2017-11-29)




**Note:** Version bump only for package @loopback/cli

<a name="4.0.0-alpha.6"></a>
# [4.0.0-alpha.6](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.5...@loopback/cli@4.0.0-alpha.6) (2017-11-09)


### Bug Fixes

* Fix CLI to include .gitignore in the templates ([842a191](https://github.com/strongloop/loopback-next/commit/842a191))




<a name="4.0.0-alpha.5"></a>
# [4.0.0-alpha.5](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.4...@loopback/cli@4.0.0-alpha.5) (2017-11-06)


### Bug Fixes

* Add start script for apps ([5ba3734](https://github.com/strongloop/loopback-next/commit/5ba3734))




<a name="4.0.0-alpha.4"></a>
# [4.0.0-alpha.4](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.3...@loopback/cli@4.0.0-alpha.4) (2017-11-06)


### Bug Fixes

* Fix cli templates ([2ebf69f](https://github.com/strongloop/loopback-next/commit/2ebf69f))




<a name="4.0.0-alpha.3"></a>
# [4.0.0-alpha.3](https://github.com/strongloop/loopback-next/compare/@loopback/cli@4.0.0-alpha.2...@loopback/cli@4.0.0-alpha.3) (2017-11-06)


### Bug Fixes

* Fix help text for cli ([8f41c2e](https://github.com/strongloop/loopback-next/commit/8f41c2e))




<a name="4.0.0-alpha.2"></a>
# 4.0.0-alpha.2 (2017-11-06)


### Features

* Add experimental CLI for LoopBack 4 ([707f692](https://github.com/strongloop/loopback-next/commit/707f692))
