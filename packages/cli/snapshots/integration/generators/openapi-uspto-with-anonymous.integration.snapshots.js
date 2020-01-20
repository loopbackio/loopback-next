// IMPORTANT
// This snapshot file is auto-generated, but designed for humans.
// It should be checked into source control and tracked carefully.
// Re-generate by setting UPDATE_SNAPSHOTS=1 and running tests.
// Make sure to inspect the changes in the snapshots below.
// Do not ignore changes!

'use strict';

exports[`openapi-generator specific files generates all the proper files 1`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {operation, param, requestBody} from '@loopback/rest';
import {PerformSearchRequestBody} from '../models/perform-search-request-body.model';
import {PerformSearchResponseBody} from '../models/perform-search-response-body.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by search
 * Search a data set
 */
export class SearchController {
  constructor() {}

  /**
   * This API is based on Solr/Lucense Search. The data is indexed using SOLR. This GET API returns the list of all the searchable field names that are in the Solr Index. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the Solr/Lucene Syntax. Please refer https://lucene.apache.org/core/3_6_2/queryparsersyntax.html#Overview for the query syntax. List of field names that are searchable can be determined using above GET api.
   * 

   * @param _requestBody 
   * @param version Version of the dataset.
   * @param dataset Name of the dataset. In this case, the default value is oa_citations
   * @returns successful operation
   */
  @operation('post', '/{dataset}/{version}/records')
  async performSearch(@requestBody() _requestBody: PerformSearchRequestBody, @param({name: 'version', in: 'path'}) version: string, @param({name: 'dataset', in: 'path'}) dataset: string): Promise<PerformSearchResponseBody> {
    throw new Error('Not implemented');
  }

}


`;


exports[`openapi-generator specific files generates all the proper files 2`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
import {operation, param, requestBody} from '@loopback/rest';
import {DataSetList} from '../models/data-set-list.model';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by metadata
 * Find out about the data sets
 */
export class MetadataController {
  constructor() {}

  /**
   * 
   * 

   * @returns Returns a list of data sets
   */
  @operation('get', '/')
  async listDataSets(): Promise<DataSetList> {
    throw new Error('Not implemented');
  }

  /**
   * This GET API returns the list of all the searchable field names that are in the oa_citations. Please see the 'fields' attribute which returns an array of field names. Each field or a combination of fields can be searched using the syntax options shown below.
   * 

   * @param dataset Name of the dataset. In this case, the default value is oa_citations
   * @param version Version of the dataset.
   * @returns The dataset api for the given version is found and it is accessible to consume.
   */
  @operation('get', '/{dataset}/{version}/fields')
  async listSearchableFields(@param({name: 'dataset', in: 'path'}) dataset: string, @param({name: 'version', in: 'path'}) version: string): Promise<string> {
    throw new Error('Not implemented');
  }

}


`;


exports[`openapi-generator specific files generates all the proper files 3`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
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
   * Uses Lucene Query Syntax in the format of propertyName:value, propertyName:[num1 TO num2] and date range format: propertyName:[yyyyMMdd TO yyyyMMdd]. In the response please see the 'docs' element which has the list of record objects. Each record structure would consist of all the fields and their corresponding values.
   */
  @property({required: true})
  criteria: string = '*:*';

  /**
   * Starting record number. Default value is 0.
   */
  @property()
  start?: number = 0;

  /**
   * Specify number of rows to be returned. If you run the search with default values, in the response you will see 'numFound' attribute which will tell the number of records available in the dataset.
   */
  @property()
  rows?: number = 100;

}

export interface PerformSearchRequestBodyRelations {
  // describe navigational properties here
}

export type PerformSearchRequestBodyWithRelations = PerformSearchRequestBody & PerformSearchRequestBodyRelations;



`;


exports[`openapi-generator specific files generates all the proper files 4`] = `
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The model type is generated from OpenAPI schema - {
  [additionalProperty: string]: {
  
};
}[]
 * performSearchResponseBody
 */
export type PerformSearchResponseBody = {
  [additionalProperty: string]: {
  
};
}[];


`;


exports[`openapi-generator specific files generates all the proper files 5`] = `
export * from './data-set-list.model';
export * from './perform-search-request-body.model';
export * from './perform-search-response-body.model';

`;


exports[`openapi-generator specific files generates all the proper files 6`] = `
export * from './metadata.controller';
export * from './search.controller';

`;
