// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`openapi-generator uspto with anonymous generates all the proper files 1`] = `
export * from './metadata.controller';
export * from './search.controller';

`;


exports[`openapi-generator uspto with anonymous generates all the proper files 2`] = `
import {api, operation, param, requestBody} from '@loopback/rest';
import {PerformSearchRequestBody} from '../models/perform-search-request-body.model';
import {PerformSearchResponseBody} from '../models/perform-search-response-body.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by search.
 *
 * Search a data set
 */
@api({
  components: {
    schemas: {
      dataSetList: {
        type: 'object',
      },
    },
  },
  paths: {},
})
export class SearchController {
    constructor() {} 
  /**
   * This API is based on Solr/Lucense Search. The data is indexed using SOLR.
This GET API returns the list of all the searchable field names that are in
the Solr Index. Please see the 'fields' attribute which returns an array of
field names. Each field or a combination of fields can be searched using the
Solr/Lucene Syntax. Please refer
https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the
query syntax. List of field names that are searchable can be determined
using above GET api.
   *
   * @param version Version of the dataset.
   * @param dataset Name of the dataset. In this case, the default value is
oa_citations
   * @param _requestBody
   * @returns successful operation
   */
  @operation('post', '/{dataset}/{version}/records', {
  tags: [
    'search',
  ],
  summary: 'Provides search capability for the data set with the given search criteria.',
  description: "This API is based on Solr/Lucense Search. The data is indexed using SOLR. This GET API returns the list of all the searchable field names that are in the Solr Index. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the Solr/Lucene Syntax. Please refer https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the query syntax. List of field names that are searchable can be determined using above GET api.",
  operationId: 'perform-search',
  parameters: [
    {
      name: 'version',
      in: 'path',
      description: 'Version of the dataset.',
      required: true,
      schema: {
        type: 'string',
        default: 'v1',
      },
    },
    {
      name: 'dataset',
      in: 'path',
      description: 'Name of the dataset. In this case, the default value is oa_citations',
      required: true,
      schema: {
        type: 'string',
        default: 'oa_citations',
      },
    },
  ],
  responses: {
    '200': {
      description: 'successful operation',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    '404': {
      description: 'No matching record found for the given criteria.',
    },
  },
  requestBody: {
    content: {
      'application/x-www-form-urlencoded': {
        schema: {
          type: 'object',
          properties: {
            criteria: {
              description: "Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.",
              type: 'string',
              default: '*:*',
            },
            start: {
              description: 'Starting record number. Default value is 0.',
              type: 'integer',
              default: 0,
            },
            rows: {
              description: "Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.",
              type: 'integer',
              default: 100,
            },
          },
          required: [
            'criteria',
          ],
        },
      },
    },
  },
})
  async performSearch(@param({
  name: 'version',
  in: 'path',
  description: 'Version of the dataset.',
  required: true,
  schema: {
    type: 'string',
    default: 'v1',
  },
}) version: string, @param({
  name: 'dataset',
  in: 'path',
  description: 'Name of the dataset. In this case, the default value is oa_citations',
  required: true,
  schema: {
    type: 'string',
    default: 'oa_citations',
  },
}) dataset: string, @requestBody({
  content: {
    'application/x-www-form-urlencoded': {
      schema: {
        type: 'object',
        properties: {
          criteria: {
            description: "Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.",
            type: 'string',
            default: '*:*',
          },
          start: {
            description: 'Starting record number. Default value is 0.',
            type: 'integer',
            default: 0,
          },
          rows: {
            description: "Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.",
            type: 'integer',
            default: 100,
          },
        },
        required: [
          'criteria',
        ],
      },
    },
  },
}) _requestBody: PerformSearchRequestBody): Promise<PerformSearchResponseBody> {
     throw new Error('Not implemented'); 
  }
}


`;


exports[`openapi-generator uspto with anonymous generates all the proper files 3`] = `
import {api, operation, param, requestBody} from '@loopback/rest';
import {DataSetList} from '../models/data-set-list.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by metadata.
 *
 * Find out about the data sets
 */
@api({
  components: {
    schemas: {
      dataSetList: {
        type: 'object',
      },
    },
  },
  paths: {},
})
export class MetadataController {
    constructor() {} 
  /**
   *
   *
   * @returns Returns a list of data sets
   */
  @operation('get', '/', {
  tags: [
    'metadata',
  ],
  operationId: 'list-data-sets',
  summary: 'List available data sets',
  responses: {
    '200': {
      description: 'Returns a list of data sets',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/dataSetList',
          },
          example: {
            total: 2,
            apis: [
              {
                apiKey: 'oa_citations',
                apiVersionNumber: 'v1',
                apiUrl: 'https://developer.uspto.gov/ds-api/oa_citations/v1/fields',
                apiDocumentationUrl: 'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/oa_citations.json',
              },
              {
                apiKey: 'cancer_moonshot',
                apiVersionNumber: 'v1',
                apiUrl: 'https://developer.uspto.gov/ds-api/cancer_moonshot/v1/fields',
                apiDocumentationUrl: 'https://developer.uspto.gov/ds-api-docs/index.html?url=https://developer.uspto.gov/ds-api/swagger/docs/cancer_moonshot.json',
              },
            ],
          },
        },
      },
    },
  },
})
  async listDataSets(): Promise<DataSetList> {
     throw new Error('Not implemented'); 
  }
  /**
   * This GET API returns the list of all the searchable field names that are in
the oa_citations. Please see the 'fields' attribute which returns an array
of field names. Each field or a combination of fields can be searched using
the syntax options shown below.
   *
   * @param dataset Name of the dataset. In this case, the default value is
oa_citations
   * @param version Version of the dataset.
   * @returns The dataset api for the given version is found and it is accessible
to consume.
   */
  @operation('get', '/{dataset}/{version}/fields', {
  tags: [
    'metadata',
  ],
  summary: 'Provides the general information about the API and the list of fields that can be used to query the dataset.',
  description: "This GET API returns the list of all the searchable field names that are in the oa_citations. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the syntax options shown below.",
  operationId: 'list-searchable-fields',
  parameters: [
    {
      name: 'dataset',
      in: 'path',
      description: 'Name of the dataset. In this case, the default value is oa_citations',
      required: true,
      schema: {
        type: 'string',
        default: 'oa_citations',
      },
    },
    {
      name: 'version',
      in: 'path',
      description: 'Version of the dataset.',
      required: true,
      schema: {
        type: 'string',
        default: 'v1',
      },
    },
  ],
  responses: {
    '200': {
      description: 'The dataset api for the given version is found and it is accessible to consume.',
      content: {
        'application/json': {
          schema: {
            type: 'string',
          },
        },
      },
    },
    '404': {
      description: 'The combination of dataset name and version is not found in the system or it is not published yet to be consumed by public.',
      content: {
        'application/json': {
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
})
  async listSearchableFields(@param({
  name: 'dataset',
  in: 'path',
  description: 'Name of the dataset. In this case, the default value is oa_citations',
  required: true,
  schema: {
    type: 'string',
    default: 'oa_citations',
  },
}) dataset: string, @param({
  name: 'version',
  in: 'path',
  description: 'Version of the dataset.',
  required: true,
  schema: {
    type: 'string',
    default: 'v1',
  },
}) version: string): Promise<string> {
     throw new Error('Not implemented'); 
  }
}


`;


exports[`openapi-generator uspto with anonymous generates all the proper files 4`] = `
export * from './data-set-list.model';
export * from './perform-search-request-body.model';
export * from './perform-search-response-body.model';

`;


exports[`openapi-generator uspto with anonymous generates all the proper files 5`] = `
import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - performSearchRequestBody
 * performSearchRequestBody
 */
@model({name: 'performSearchRequestBody'})
export class PerformSearchRequestBody {
  constructor(data?: Partial<PerformSearchRequestBody>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Uses Lucene Query Syntax in the format of propertyName:value,
propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO
yyyyMMdd]. In the response please see the 'docs' element which has the list
of record objects. Each record structure would consist of all the fields and
their corresponding values.
   */
  @property({required: true, jsonSchema: {
  description: "Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.",
  type: 'string',
  default: '*:*',
}})
  criteria: string = '*:*';

  /**
   * Starting record number. Default value is 0.
   */
  @property({jsonSchema: {
  description: 'Starting record number. Default value is 0.',
  type: 'integer',
  default: 0,
}})
  start?: number = 0;

  /**
   * Specify number of rows to be returned. If you run the search with default
values, in the response you will see 'numFound' attribute which will tell
the number of records available in the dataset.
   */
  @property({jsonSchema: {
  description: "Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.",
  type: 'integer',
  default: 100,
}})
  rows?: number = 100;

}

export interface PerformSearchRequestBodyRelations {
  // describe navigational properties here
}

export type PerformSearchRequestBodyWithRelations = PerformSearchRequestBody & PerformSearchRequestBodyRelations;



`;


exports[`openapi-generator uspto with anonymous generates all the proper files 6`] = `
/**
 * The model type is generated from OpenAPI schema - {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [additionalProperty: string]: any;
}[]
 * performSearchResponseBody
 */
export type PerformSearchResponseBody = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [additionalProperty: string]: any;
}[];


`;
