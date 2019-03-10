// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const expect = require('@loopback/testlab').expect;
const {
  loadSpec,
  loadAndBuildSpec,
} = require('../../../generators/openapi/spec-loader');
const {
  generateModelSpecs,
} = require('../../../generators/openapi/schema-helper');
const path = require('path');

describe('schema to model', () => {
  let usptoSpec, usptoSpecAnonymous, petstoreSpec, customerSpec;
  const uspto = path.join(__dirname, '../../fixtures/openapi/3.0/uspto.yaml');
  const petstore = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/petstore-expanded.yaml',
  );
  const customer = path.join(
    __dirname,
    '../../fixtures/openapi/3.0/customer.yaml',
  );

  before(async () => {
    usptoSpec = await loadSpec(uspto);
    usptoSpecAnonymous = await loadAndBuildSpec(uspto, {
      promoteAnonymousSchemas: true,
    });
    petstoreSpec = await loadSpec(petstore);
    customerSpec = await loadSpec(customer);
  });

  it('generates models for uspto', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(usptoSpec, {objectTypeMapping});
    expect(models).to.eql([
      {
        name: 'dataSetList',
        description: 'dataSetList',
        className: 'DataSetList',
        fileName: 'data-set-list.model.ts',
        import: "import {DataSetList} from './data-set-list.model';",
        imports: [],
        kind: 'class',
        properties: [
          {
            name: 'total',
            signature: 'total?: number;',
            decoration: "@property({name: 'total'})",
          },
          {
            name: 'apis',
            signature:
              'apis?: {\n  apiKey?: string;\n  apiVersionNumber?: string;\n' +
              '  apiUrl?: string;\n  apiDocumentationUrl?: string;\n}[];',
            decoration: "@property({name: 'apis'})",
          },
        ],
        declaration:
          '{\n  total?: number;\n  apis?: {\n  apiKey?: string;\n' +
          '  apiVersionNumber?: string;\n  apiUrl?: string;\n' +
          '  apiDocumentationUrl?: string;\n}[];\n}',
        signature: 'DataSetList',
      },
    ]);
  });

  it('generates models for uspto with promoted anonymous schemas', () => {
    const models = usptoSpecAnonymous.modelSpecs;
    expect(models).to.eql([
      {
        description: 'dataSetList',
        name: 'dataSetList',
        className: 'DataSetList',
        fileName: 'data-set-list.model.ts',
        properties: [
          {
            name: 'total',
            signature: 'total?: number;',
            decoration: "@property({name: 'total'})",
          },
          {
            name: 'apis',
            signature:
              'apis?: {\n  apiKey?: string;\n  apiVersionNumber?: string;\n  ' +
              'apiUrl?: string;\n  apiDocumentationUrl?: string;\n}[];',
            decoration: "@property({name: 'apis'})",
          },
        ],
        imports: [],
        import: "import {DataSetList} from './data-set-list.model';",
        kind: 'class',
        declaration:
          '{\n  total?: number;\n  apis?: {\n  apiKey?: string;\n  ' +
          'apiVersionNumber?: string;\n  apiUrl?: string;\n  ' +
          'apiDocumentationUrl?: string;\n}[];\n}',
        signature: 'DataSetList',
      },
      {
        description: 'performSearchRequestBody',
        name: 'performSearchRequestBody',
        className: 'PerformSearchRequestBody',
        fileName: 'perform-search-request-body.model.ts',
        properties: [
          {
            name: 'criteria',
            signature: "criteria: string = '*:*';",
            decoration: "@property({name: 'criteria', required: true})",
            description:
              'Uses Lucene Query Syntax in the format of propertyName:value, ' +
              'propertyName:[num1 TO num2] and date range format: ' +
              'propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please ' +
              "see the 'docs' element which has the list of record objects. " +
              'Each record structure would consist of all the fields and ' +
              'their corresponding values.',
          },
          {
            name: 'start',
            signature: 'start?: number = 0;',
            decoration: "@property({name: 'start'})",
            description: 'Starting record number. Default value is 0.',
          },
          {
            name: 'rows',
            signature: 'rows?: number = 100;',
            decoration: "@property({name: 'rows'})",
            description:
              'Specify number of rows to be returned. If you run the search ' +
              "with default values, in the response you will see 'numFound' " +
              'attribute which will tell the number of records available in ' +
              'the dataset.',
          },
        ],
        imports: [],
        import:
          "import {PerformSearchRequestBody} from './perform-search-request-body.model';",
        kind: 'class',
        declaration:
          "{\n  criteria: string = '*:*';\n  start?: number = 0;\n  " +
          'rows?: number = 100;\n}',
        signature: 'PerformSearchRequestBody',
      },
      {
        description: 'performSearchResponseBody',
        name: '{\n  [additionalProperty: string]: {\n  \n};\n}[]',
        className: 'PerformSearchResponseBody',
        fileName: 'perform-search-response-body.model.ts',
        properties: [],
        imports: [],
        import:
          'import {PerformSearchResponseBody} from ' +
          "'./perform-search-response-body.model';",
        declaration: '{\n  [additionalProperty: string]: {\n  \n};\n}[]',
        signature: 'PerformSearchResponseBody',
        itemType: {
          imports: [],
          declaration: '{\n  [additionalProperty: string]: {\n  \n};\n}',
          properties: [],
          signature: '{\n  [additionalProperty: string]: {\n  \n};\n}',
        },
      },
    ]);
  });

  it('generates models for petstore', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(petstoreSpec, {objectTypeMapping});
    expect(models).to.eql([
      {
        name: 'Pet',
        className: 'Pet',
        fileName: 'pet.model.ts',
        description: 'Pet',
        properties: [],
        imports: ["import {NewPet} from './new-pet.model';"],
        members: [
          {
            name: 'NewPet',
            description: 'NewPet',
            className: 'NewPet',
            fileName: 'new-pet.model.ts',
            kind: 'class',
            properties: [
              {
                name: 'name',
                signature: 'name: string;',
                decoration: "@property({name: 'name', required: true})",
              },
              {
                name: 'tag',
                signature: 'tag?: string;',
                decoration: "@property({name: 'tag'})",
              },
            ],
            imports: [],
            declaration: '{\n  name: string;\n  tag?: string;\n}',
            signature: 'NewPet',
            import: "import {NewPet} from './new-pet.model';",
          },
          {
            declaration: '{\n  id: number;\n}',
            imports: [],
            properties: [
              {
                name: 'id',
                signature: 'id: number;',
                decoration: "@property({name: 'id', required: true})",
              },
            ],
            signature: '{\n  id: number;\n}',
          },
        ],
        declaration: 'NewPet & {\n  id: number;\n}',
        signature: 'Pet',
        import: "import {Pet} from './pet.model';",
      },
      {
        name: 'NewPet',
        description: 'NewPet',
        className: 'NewPet',
        fileName: 'new-pet.model.ts',
        kind: 'class',
        properties: [
          {
            name: 'name',
            signature: 'name: string;',
            decoration: "@property({name: 'name', required: true})",
          },
          {
            name: 'tag',
            signature: 'tag?: string;',
            decoration: "@property({name: 'tag'})",
          },
        ],
        imports: [],
        declaration: '{\n  name: string;\n  tag?: string;\n}',
        signature: 'NewPet',
        import: "import {NewPet} from './new-pet.model';",
      },
      {
        name: 'Error',
        description: 'Error',
        className: 'Error',
        fileName: 'error.model.ts',
        kind: 'class',
        properties: [
          {
            name: 'code',
            signature: 'code: number;',
            decoration: "@property({name: 'code', required: true})",
          },
          {
            name: 'message',
            signature: 'message: string;',
            decoration: "@property({name: 'message', required: true})",
          },
        ],
        imports: [],
        declaration: '{\n  code: number;\n  message: string;\n}',
        signature: 'Error',
        import: "import {Error} from './error.model';",
      },
    ]);
  });

  it('generates models for customer', () => {
    const objectTypeMapping = new Map();
    const models = generateModelSpecs(customerSpec, {objectTypeMapping});
    expect(models).to.eql([
      {
        description: 'Name',
        name: 'Name',
        className: 'Name',
        fileName: 'name.model.ts',
        properties: [],
        imports: [],
        import: "import {Name} from './name.model';",
        declaration: 'string',
        signature: 'Name',
      },
      {
        description: 'Address',
        name: 'Address',
        className: 'Address',
        fileName: 'address.model.ts',
        properties: [
          {
            name: 'street',
            signature: 'street?: string;',
            decoration: "@property({name: 'street'})",
          },
          {
            name: 'city',
            signature: 'city?: string;',
            decoration: "@property({name: 'city'})",
          },
          {
            name: 'state',
            signature: 'state?: string;',
            decoration: "@property({name: 'state'})",
          },
          {
            name: 'zipCode',
            signature: 'zipCode?: string;',
            decoration: "@property({name: 'zipCode'})",
          },
        ],
        imports: [],
        import: "import {Address} from './address.model';",
        kind: 'class',
        declaration:
          '{\n  street?: string;\n  city?: string;\n  state?: string;\n  ' +
          'zipCode?: string;\n}',
        signature: 'Address',
      },
      {
        description: 'Customer',
        name: 'Customer',
        className: 'Customer',
        fileName: 'customer.model.ts',
        properties: [
          {
            name: 'id',
            signature: 'id: number;',
            decoration: "@property({name: 'id', required: true})",
          },
          {
            name: 'first-name',
            signature: "'first-name'?: string;",
            decoration: "@property({name: 'first-name'})",
          },
          {
            name: 'last-name',
            signature: "'last-name'?: Name;",
            decoration: "@property({name: 'last-name'})",
          },
          {
            decoration: "@property.array(String, {name: 'emails'})",
            name: 'emails',
            signature: 'emails?: string[];',
          },
          {
            name: 'addresses',
            signature: 'addresses?: Address[];',
            decoration: "@property.array(Address, {name: 'addresses'})",
          },
        ],
        imports: [
          "import {Name} from './name.model';",
          "import {Address} from './address.model';",
        ],
        import: "import {Customer} from './customer.model';",
        kind: 'class',
        declaration:
          "{\n  id: number;\n  'first-name'?: string;\n  'last-name'?: Name;\n" +
          '  emails?: string[];\n  addresses?: Address[];\n}',
        signature: 'Customer',
      },
    ]);
  });
});
