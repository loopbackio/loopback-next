/* eslint-disable @typescript-eslint/naming-convention */
import {
  InfoObject as OAS30InfoObject,
  OpenAPIObject as OAS30OpenAPIOboject,
  OperationObject as OAS30OperationObject,
  ParameterObject as OAS30ParameterObject,
} from '@loopback/rest';
import {
  XEmbeddedDoc,
  XExample,
  XIBMConfiguration,
  XIBMLanguages,
} from './oas-extensions';

export interface OpenAPIObject extends OAS30OpenAPIOboject {
  info: InfoObject;
  'x-ibm-configuration': XIBMConfiguration;
  'x-embedded-doc'?: XEmbeddedDoc[];
}
export interface InfoObject extends OAS30InfoObject {
  'x-ibm-name': string;
  'x-pathalias'?: string;
}

/**
 * {@inheritDoc OperationObject}
 */
export interface OperationObject extends OAS30OperationObject {
  'x-ibm-languages': XIBMLanguages;
}

/**
 * {@inheritDoc ParameterObject}
 */
export interface ParameterObject extends OAS30ParameterObject {
  'x-example': XExample;
}
