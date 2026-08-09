// /* eslint-disable @typescript-eslint/naming-convention */
// /* eslint-disable @typescript-eslint/no-shadow */

// export namespace APIConnectOASExtensions {

//   export type XIBMConfiguration =
//     | XIBMConfiguration.DataPowerGateway
//     | XIBMConfiguration.DataPowerAPIGateway;

//   export namespace XIBMConfiguration {

//     export interface DataPowerGateway {
//       phase: 'identified' | 'specified' | 'realized';
//       testable?: boolean;
//       enforced?: boolean;
//       cors?: {
//         enabled: boolean;
//       };
//       assembly?: Assembly.DataPowerGateway;
//       gateway?: 'datapower-gateway';
//       type?: 'rest' | 'wsdl';
//       properties?: Properties;
//       catalogs?: Catalogs;
//       /**
//        * @example
//        * ```typescript
//        * {
//        *   extensions: {
//        *     banking: '1.0.0'
//        *   }
//        * }
//        * ```
//        */
//       extensions?: {[extensionName: string]: string};
//     }

//     export interface DataPowerAPIGateway
//       extends Pick<
//         DataPowerGateway,
//         | 'phase'
//         | 'testable'
//         | 'enforced'
//         | 'cors'
//         | 'type'
//         | 'properties'
//         | 'catalogs'
//       > {
//       assembly?: Assembly.DataPowerAPIGateway;
//       gateway?: 'datapower-api-gateway';
//       /**
//        * @example Use defaults
//        * ```typescript
//        * {
//        *   version: '1.0.0',
//        *   title: 'default activity logging',
//        * }
//        * ```
//        *
//        * @example No logging for successful calls
//        * ```typescript
//        * {
//        *   version: '1.0.0',
//        *   title: 'no logging for successful calls',
//        *   content: 'none',
//        *   'error-content': 'activity',
//        * }
//        * ```
//        */
//       'activity-log'?: ActivityLog;
//     }

//     export type Assembly = Assembly.DataPowerGateway | DataPowerAPIGateway;

//     export namespace Assembly {
//       export interface DataPowerGateway {
//         execute?: Execute.DataPowerGateway[];
//         catch?: Catch<Execute.DataPowerGateway>[];
//       }

//       export interface DataPowerAPIGateway {
//         execute?: Execute.DataPowerAPIGateway[];
//         catch?: Catch<Execute.DataPowerAPIGateway>[];
//       }

//       export type Execute =
//         | Execute.DataPowerGateway
//         | Execute.DataPowerAPIGateway;

//       export namespace Execute {
//         // export interface DataPowerGateway {
//         //   gatewayscript?: GatewayScriptPolicy.DataPowerGateway;
//         //   if?: IfPolicy.DataPowerGateway;
//         //   invoke?: InvokePolicy.DataPowerGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'JSON to XML transform',
//         //    *   description: 'Transforms JSON message body to XML format',
//         //    * }
//         //    * ```
//         //    */
//         //   'json-to-xml'?: JSONToXMLPolicy.DataPowerGateway;
//         //   'jwt-generate'?: JWTGenerate.DataPowerGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'jwt-validate',
//         //    *   jwt: 'request.headers.authorization',
//         //    *   'output-claims': 'decoded.claims',
//         //    *   'iss-claim': "'^data.*'",
//         //    *   'aud-claim': "'^id.*'",
//         //    *   'jwe-crypto': 'jweCryptoObjectName',
//         //    *   'jwe-jwk': 'jwe.jwk',
//         //    *   'jws-crypto': 'jwsCryptoObjectName',
//         //    *   'jws-jwk': 'jws.jwk',
//         //    * }
//         //    * ```
//         //    */
//         //   'jwt-validate'?: JWTValidate.DataPowerGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'Gather activity log data for processing',
//         //    *   mode: 'gather-only',
//         //    * }
//         //    * ```
//         //    */
//         //   // log?: Execute.LogPolicy.;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'Output mapping',
//         //    *   inputs: {
//         //    *     Monthly_cost: {
//         //    *       schema: {
//         //    *         type: 'double',
//         //    *       },
//         //    *       variable: 'loan_invoke.body.monthly_payment',
//         //    *       content: 'application/json',
//         //    *     },
//         //    *     Duration: {
//         //    *       schema: {
//         //    *         type: 'integer',
//         //    *       },
//         //    *       variable: 'request.parameters.duration',
//         //    *     },
//         //    *   },
//         //    *   outputs: {
//         //    *     Quote_Output: {
//         //    *       schema: {
//         //    *         $ref: '#/definitions/Quote_Output',
//         //    *       },
//         //    *       variable: 'message.body',
//         //    *       content: 'application/json',
//         //    *     },
//         //    *   actions: [
//         //    *     {
//         //    *       set: 'Quote_Output.monthly_repayment',
//         //    *       from: 'Monthly_cost',
//         //    *       value: '',
//         //    *     },
//         //    *     {
//         //    *       from: [
//         //    *         'Duration',
//         //    *         'Monthly_cost',
//         //    *       ],
//         //    *       value: '$(Duration)*$(Monthly_cost)',
//         //    *     },
//         //    *   ],
//         //    *   description: 'Maps and transforms contexts to the operation output.',
//         //    *   options: {
//         //    *     includeEmptyXMLElements: false,
//         //    *     namespaceInheritance: false,
//         //    *     inlineNamespaces: false,
//         //    *     mapResolveXMLInputDataType: true,
//         //    *     mapXMLEmptyElement: null,
//         //    *     mapArrayFirstElementValue: false,
//         //    *     mapResolveApicVariables: false,
//         //    *     mapNullValue: true,
//         //    *     mapOptimizeSchemaDefinition: true,
//         //    *     mapCreateEmptyArray: parent,
//         //    *     mapReferenceLimit: 5,
//         //    *     messagesInputData: 'warn',
//         //    *     mapEmulateV4EmptyJSONObject: true,
//         //    *   },
//         //    * }
//         //    * ```
//         //    */
//         //   map?: MapPolicy.DataPowerGateway;
//         //   'operation-switch'?: OperationSwitchPolicy.DataPowerGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'my-oauth-policy',
//         //    *   oauth-provider-settings-ref: {
//         //    *     default: 'my-oauth',
//         //    *   },
//         //    *   supported-oauth-components: [
//         //    *     'OAuthGenerateAZCode',
//         //    *     'OAuthGenerateAccessToken',
//         //    *     'OAuthIntrospectToken',
//         //    *     'OAuthVerifyAZCode',
//         //    *     'OAuthVerifyRefreshToken',
//         //    *   ],
//         //    * }
//         //    * ```
//         //    */
//         //   // oauth?: Execute.OAuthPolicy.;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'my-parse-policy',
//         //    *   'use-content-type': true,
//         //    *   'parse-settings-reference': {
//         //    *     default: 'my-parse',
//         //    *   },
//         //    *   input: 'input-message'
//         //    *   output: 'output-message'
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Literal example (in XML)
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'parse',
//         //    *   parse-settings-reference: {
//         //    *     default: 'apic-default-parsesettings',
//         //    *   },
//         //    *   literal: '<ParseSettings><DocumentType>xml</DocumentType></ParseSettings>',
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Literal example (in JSON)
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'parse',
//         //    *   parse-settings-reference: {
//         //    *     default: 'apic-default-parsesettings',
//         //    *   },
//         //    *   literal: '{ "ParseSettings" : { "propertyName" : propertyValue } }'
//         //    * }
//         //    * ```
//         //    */
//         //   // parse?: Execute.ParsePolicy.;
//         //   proxy?: ProxyPolicy.DataPowerGateway;
//         //   // ratelimit?: Execute.RateLimitPolicy.;
//         //   /**
//         //    * @example DataPower API Gateway
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'remove price, redact author',
//         //    *   redactions: [
//         //    *     {
//         //    *       action: 'remove',
//         //    *       path: 'xpath($, "//price")',
//         //    *     },
//         //    *     {
//         //    *       action: 'redact',
//         //    *       path: '$.**.author',
//         //    *     },
//         //    *   root: 'message.body',
//         //    * }
//         //    * ```
//         //    *
//         //    * @example DataPower Gateway (v5 Compatible)
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'remove secret field, redact address,'
//         //    *   actions: [
//         //    *     {
//         //    *       action: 'remove',
//         //    *       from: ['all'],
//         //    *       path: '/document/user/secret',
//         //    *     },
//         //    *     {
//         //    *       action: 'redact',
//         //    *       from: [
//         //    *         'request',
//         //    *         'response',
//         //    *       ],
//         //    *       path: "//*[@name='secondaryAddress']/*[@name='streetAddress']",
//         //    *     ],
//         //    *   },
//         //    * }
//         //    * ```
//         //    */
//         //   redact?: RedactPolicy.DataPowerGateway;
//         //   /**
//         //    * @example Clear a variable
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'clear_region',
//         //    *   actions: [
//         //    *     {clear: 'message.headers.region'},
//         //    *   ],
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Set a variable to the value of an API Gateway context variable
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'set content type',
//         //    *   actions: [
//         //    *     {
//         //    *       set: 'message.headers.contenttype',
//         //    *       value: '$(message.headers.content-type)',
//         //    *       type: 'string',
//         //    *     },
//         //    *   ],
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Add a variable
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'set-variable',
//         //    *   actions: [
//         //    *     {
//         //    *       value: 'testing add',
//         //    *       add: 'message.headers.jja',
//         //    *       type: 'string',
//         //    *     },
//         //    *   ],
//         //    * }
//         //    * ```
//         //    */
//         //   'set-variable'?: SetVariablePolicy.DataPowerGateway;
//         //   switch?: SwitchPolicy.DataPowerGateway[];
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '1.0.0',
//         //    *   title: 'throw',
//         //    *   name: '404'
//         //    *   message: 'Not found',
//         //    * }
//         //    * ```
//         //    */
//         //   throw?: ThrowPolicy.DataPowerGateway;
//         //   'user-defined-policy'?: UserDefinedPolicy;
//         //   validate?: ValidatePolicy.DataPowerGateway;
//         //   'validate-username-token'?: ValidateUsernameTokenPolicy.DataPowerGateway;
//         //   'xml-to-json'?: XMLToJSONPolicy.DataPowerGateway;
//         //   xslt?: XSLTPolicy.DataPowerGateway;
//         // }

//         // export interface DataPowerAPIGateway {
//         //   'activity-log'?: {
//         //     /**
//         //      * @defaultValue `'activity'`
//         //      */
//         //     'success-content'?: 'none' | 'activity' | 'header' | 'payload';
//         //     /**
//         //      * @defaultValue `'payload'`
//         //      */
//         //     'error-content'?: 'none' | 'activity' | 'header' | 'payload';
//         //     enabled?: boolean;
//         //   };
//         //   'client-security'?: Execute.ClientSecurityPolicy.DataPowerAPIGateway;
//         //   gatewayscript?: Execute.GatewayScriptPolicy.DataPowerAPIGateway;
//         //   'graphql-introspect'?: Execute.GraphQLIntrospectPolicy.DataPowerAPIGateway;
//         //   invoke?: Execute.InvokePolicy.DataPowerAPIGateway;
//         //   'json-to-xml'?: Execute.JSONToXMLPolicy.DataPowerAPIGateway;
//         //   'jwt-generate'?: Execute.JWTGenerate.DataPowerAPIGateway;
//         //   'jwt-validate'?: Execute.JWTValidate.DataPowerAPIGateway;
//         //   log?: Execute.LogPolicy.DataPowerAPIGateway;
//         //   map?: Execute.MapPolicy.DataPowerAPIGateway;
//         //   'operation-switch'?: Execute.OperationSwitchPolicy.DataPowerAPIGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'my-oauth-policy',
//         //    *   oauth-provider-settings-ref: {
//         //    *     default: 'my-oauth',
//         //    *   },
//         //    *   supported-oauth-components: [
//         //    *     'OAuthGenerateAZCode',
//         //    *     'OAuthGenerateAccessToken',
//         //    *     'OAuthIntrospectToken',
//         //    *     'OAuthVerifyAZCode',
//         //    *     'OAuthVerifyRefreshToken',
//         //    *   ],
//         //    * }
//         //    * ```
//         //    */
//         //   oauth?: Execute.OAuthPolicy.DataPowerAPIGateway;
//         //   /**
//         //    * @example
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'my-parse-policy',
//         //    *   'use-content-type': true,
//         //    *   'parse-settings-reference': {
//         //    *     default: 'my-parse',
//         //    *   },
//         //    *   input: 'input-message'
//         //    *   output: 'output-message'
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Literal example (in XML)
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'parse',
//         //    *   parse-settings-reference: {
//         //    *     default: 'apic-default-parsesettings',
//         //    *   },
//         //    *   literal: '<ParseSettings><DocumentType>xml</DocumentType></ParseSettings>',
//         //    * }
//         //    * ```
//         //    *
//         //    * @example Literal example (in JSON)
//         //    * ```typescript
//         //    * {
//         //    *   version: '2.0.0',
//         //    *   title: 'parse',
//         //    *   parse-settings-reference: {
//         //    *     default: 'apic-default-parsesettings',
//         //    *   },
//         //    *   literal: '{ "ParseSettings" : { "propertyName" : propertyValue } }'
//         //    * }
//         //    * ```
//         //    */
//         //   parse?: Execute.ParsePolicy.DataPowerAPIGateway;
//         //   ratelimit?: Execute.RateLimitPolicy.DataPowerAPIGateway;
//         //   redact?: Execute.RedactPolicy.DataPowerAPIGateway;
//         //   'set-variable'?: Execute.SetVariablePolicy.DataPowerAPIGateway;
//         //   switch?: Execute.SwitchPolicy.DataPowerAPIGateway[];
//         //   throw?: Execute.ThrowPolicy.DataPowerAPIGateway;
//         //   'user-defined-policy'?: Execute.UserDefinedPolicy;
//         //   validate?: Execute.ValidatePolicy.DataPowerAPIGateway;
//         //   'xml-to-json'?: Execute.XMLToJSONPolicy.DataPowerAPIGateway;
//         //   xslt?: Execute.XSLTPolicy.DataPowerAPIGateway;
//         // }z

//         export type DataPowerGateway = V100;
//         export type DataPowerAPIGateway = V200 | V210 | V220 | V230;

//         export type V230Min = V230;
//         export type V220Min = V230Min | V220;
//         export type V210Min = V220Min | V210
//         export type V200Min = V210Min | V200;
//         export type V100Min = V100;

//         export interface V100 {
//           gatewayscript?: GatewayScriptPolicy.V100;
//           if?: IfPolicy.V100;
//           invoke?: InvokePolicy.V100;
//           'jwt-validate'?: JWTValidate.V100;
//           map?: MapPolicy.V100;
//           'operation-switch'?: OperationSwitchPolicy.V100;
//           proxy?: ProxyPolicy.V100;
//           redact?: RedactPolicy.V100;
//           'set-variable'?: SetVariablePolicy.V100;
//           switch?: SwitchPolicy.V100[];
//           throw?: ThrowPolicy.V100;
//           'user-defined-policy'?: UserDefinedPolicy;
//           validate?: ValidatePolicy.V100;
//           'validate-username-token'?: ValidateUsernameTokenPolicy.V100;
//           'xml-to-json'?: XMLToJSONPolicy.V100;
//           xslt?: XSLTPolicy.V100;
//         }

//         export interface V200 extends Pick<V100,'user-defined-policy'> {
//           'activity-log'?: {
//             /**
//              * @defaultValue `'activity'`
//              */
//             'success-content'?: 'none' | 'activity' | 'header' | 'payload';
//             /**
//              * @defaultValue `'payload'`
//              */
//             'error-content'?: 'none' | 'activity' | 'header' | 'payload';
//             enabled?: boolean;
//           };
//           'client-security'?: ClientSecurityPolicy.V200;
//           gatewayscript?: GatewayScriptPolicy.V200;
//           'graphql-introspect'?: GraphQLIntrospectPolicy.V200;
//           invoke?: InvokePolicy.V200;
//           'json-to-xml'?: JSONToXMLPolicy.V200;
//           'jwt-generate'?: JWTGenerate.V200;
//           'jwt-validate'?: JWTValidate.V200;
//           log?: LogPolicy.V200;
//           map?: MapPolicy.V200;
//           'operation-switch'?: OperationSwitchPolicy.V200;
//           oauth?: OAuthPolicy.V200;
//           parse?: ParsePolicy.V200;
//           ratelimit?: RateLimitPolicy.V200;
//           redact?: RedactPolicy.V200;
//           'set-variable'?: SetVariablePolicy.V200;
//           switch?: SwitchPolicy.V200[];
//           throw?: ThrowPolicy.V200;
//           validate?: ValidatePolicy.V200;
//           'xml-to-json'?: XMLToJSONPolicy.V200;
//           xslt?: XSLTPolicy.V200;
//         }

//         export interface V210 extends Omit<V200,'log'|'operation-switch'|'switch'|'throw'> {
//           log?: LogPolicy.V210;
//           'operation-switch'?: OperationSwitchPolicy.V200<Execute.V210>;
//           switch?: SwitchPolicy.V200<Execute.V210>[];
//           throw?: ThrowPolicy.V210;
//         }

//         export interface V220 extends Omit<V210,'invoke'|'operation-switch'|'switch'> {
//           invoke?: InvokePolicy.V220;
//           'operation-switch'?: OperationSwitchPolicy.V200<Execute.V220>;
//           switch?: SwitchPolicy.V200<Execute.V220>;
//         }

//         export interface V230 extends Omit<V220,'invoke'|'operation-switch'|'switch'> {
//           invoke?: InvokePolicy.V230;
//           'operation-switch'?: OperationSwitchPolicy.V200<Execute.V230>;
//           switch?: SwitchPolicy.V200<Execute.V230>;
//         }
//       }

//         export type ActivityLogPolicy = ActivityLogPolicy.DataPowerGateway;

//         export namespace ActivityLogPolicy {
//           export type DataPowerGateway = V100;

//           export interface V100 {
//             version: '1.0.0';
//             title: string;
//             description?: string;
//             content: 'none' | 'activity' | 'header' | 'payload';
//             'error-content': 'none' | 'activity' | 'header' | 'payload';
//           }
//         }

//         export type ClientSecurityPolicy =
//           ClientSecurityPolicy.DataPowerAPIGateway;

//         export namespace ClientSecurityPolicy {
//           export type DataPowerAPIGateway = V200;

//           export interface V200 {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             'stop-on-error': boolean;
//             'secret-required': boolean;
//             'extract-credential-method':
//               | 'header'
//               | 'query'
//               | 'form'
//               | 'cookie'
//               | 'http'
//               | 'context-var';
//             'id-name'?: string;
//             'secret-name'?: string;
//             'http-type'?: 'basic';
//             'client-auth-method': 'native' | 'third-party';
//             'user-registry': string;
//           }
//         }

//         export type GatewayScriptPolicy =
//           | GatewayScriptPolicy.DataPowerGateway
//           | GatewayScriptPolicy.DataPowerAPIGateway;

//         export namespace GatewayScriptPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             source: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//           }
//         }

//         export type GraphQLIntrospectPolicy =
//           GraphQLIntrospectPolicy.DataPowerAPIGateway;

//         export namespace GraphQLIntrospectPolicy {
//           export type DataPowerAPIGateway = V200;
//           export interface V200 {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             input?: string;
//             output?: string;
//           }
//         }

//         export type IfPolicy = IfPolicy.DataPowerGateway;

//         export namespace IfPolicy {
//           export type DataPowerGateway = V100;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             condition: string;
//             execute: string;
//           }
//         }

//         export type InvokePolicy =
//           | InvokePolicy.DataPowerGateway
//           | InvokePolicy.DataPowerAPIGateway;

//         export namespace InvokePolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200 | V210 | V220 | V230;
//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             'target-url': string;
//             'tls-profile'?: string;
//             /**
//              * @defaultValue `'GET'`
//              */
//             verb?:
//               | 'GET'
//               | 'POST'
//               | 'PUT'
//               | 'DELETE'
//               | 'PATCH'
//               | 'HEAD'
//               | 'OPTIONS';
//             /**
//              * @defaultValue `60`
//              */
//             timeout?: number;
//             /**
//              * @defaultValue `false`
//              */
//             compression?: boolean;
//             username?: string;
//             password?: string;
//             output?: string;
//             'cache-key'?: string;
//             /**
//              * @defaultValue `'protocol'`
//              */
//             'cache-response'?: 'protocol' | 'no-cache' | 'time-to-live';
//             /**
//              * @defaultValue `false`
//              */
//             'cache-putpost-response'?: boolean;
//             /**
//              * @remarks
//              * Valid range: 5-31708800
//              * @defaultValue `900`
//              */
//             'cache-ttl'?: number;
//             'stop-on-error'?: string[];
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//             /**
//              * @defaultValue `'detect'`
//              */
//             'backend-type'?: 'detect' | 'xml' | 'json' | 'binary' | 'graphql';
//             /**
//              * @defaultValue `false`
//              */
//             'inject-proxy-headers'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'decode-request-params'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'encode-plus-char'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'keep-payload'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'use-http-10'?: boolean;
//             /**
//              * @defaultValue `true`
//              */
//             'chunked-uploads'?: boolean;
//             /**
//              * @defaultValue
//              * ```typescript
//              * {
//              *   type: 'blacklist',
//              *   values: [],
//              * }
//              * ```
//              */
//             'header-control'?: {
//               type: 'blacklist' | 'whitelist';
//               values: string[];
//             };
//             /**
//              * @defaultValue
//              * ```typescript
//              * {
//              *   type: 'whitelist',
//              *   values: [],
//              * }
//              * ```
//              */
//             'parameter-control'?: {
//               type: 'blacklist' | 'whitelist';
//               values: string[];
//             };
//             'follow-redirect'?: boolean;
//           }

//           export interface V210 extends Omit<V200, 'version'> {
//             version: '2.1.0';
//             'http-version': 'HTTP/1.0' | 'HTTP/1.1' | 'HTTP/2';
//             'http2-required'?: boolean;
//             'websocket-upgrade'?: boolean;
//           }

//           export type V220 =
//             | (Omit<V210, 'version'> & {version: '2.2.0'})
//             | (Omit<V210, 'version' | 'verb' | 'backend-type'> & {
//                 version: '2.2.0';
//               } & {
//                 'graphql-send-type': 'detect' | 'graphql' | 'json';
//                 'backend-type': 'graphql' | 'detect';
//                 verb: 'Keep' | 'POST';
//               });

//           export type V230 = Omit<V220, 'version'> & {
//             version: '2.3.0';
//             /**
//              * @defaultValue `true`
//              */
//             'persistent-connection'?: boolean;
//           };
//         }

//         export type JSONToXMLPolicy =
//           | JSONToXMLPolicy.DataPowerGateway
//           | JSONToXMLPolicy.DataPowerAPIGateway;

//         export namespace JSONToXMLPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title: string;
//             description?: string;
//             'root-element-name': string;
//             'always-output-root-element': boolean;
//             'unnamed-element-name'?: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//             input?: string;
//             output?: string;
//             conversionType?: 'None' | 'badgerFish';
//           }
//         }

//         export type JWTGenerate =
//           | JWTGenerate.DataPowerGateway
//           | JWTGenerate.DataPowerAPIGateway;

//         export namespace JWTGenerate {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;
//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             jwt?: string;
//             'jti-claim'?: boolean;
//             /**
//              * @defaultValue `'iss.claim'`
//              */
//             'iss-claim'?: string; // #TODO: Confirm is mandatory. Default is "iss.claim"
//             'sub-claim'?: string;
//             'aud-claim'?: string;
//             /**
//              * @defaultValue `3600`
//              */
//             'exp-claim'?: number; // #TODO: Confirm is mandatory. Default is 3600.
//             'private-claims'?: string;
//             'jws-jwk'?: string;
//             'jws-alg'?:
//               | 'HS256'
//               | 'HS384'
//               | 'HS512'
//               | 'RS256'
//               | 'RS384'
//               | 'RS512'
//               | 'ES256'
//               | 'ES384'
//               | 'ES512'
//               | 'PS256'
//               | 'PS384'
//               | 'PS512';
//             'jws-crypto'?: string;
//             'jws-enc'?: 'A128CBC-HS256' | 'A192CBC-HS384' | 'A256CBC-HS512';
//             'jwe-jwk'?: string;
//             'jwe-alg'?:
//               | 'RSA1_5'
//               | 'RSA-OAEP'
//               | 'RSA-OAEP-256'
//               | 'dir'
//               | 'A128KW'
//               | 'A192KW'
//               | 'A256KW';
//             'jwe-crypto': string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//           }
//         }

//         export type JWTValidate =
//           | JWTValidate.DataPowerGateway
//           | JWTValidate.DataPowerAPIGateway;

//         export namespace JWTValidate {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: 'V100';
//             title: string;
//             description?: string;
//             jwt: string;
//             /**
//              * @defaultValue `'decoded.claims'`
//              */
//             'output-claims'?: string; // #TODO: Confirm if mandatory. Default value is "decoded.claims"
//             'iss-claim'?: string;
//             'aud-claim'?: string;
//             'jwe-crypto'?: string;
//             'jwe-jwk'?: string;
//             'jws-crypto'?: string;
//             'jws-jwk'?: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//           }
//         }

//         export type LogPolicy = LogPolicy.DataPowerAPIGateway;

//         export namespace LogPolicy {
//           export type DataPowerAPIGateway = V200 | V210;

//           export interface V200 {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             mode: 'gather-only' | 'send-only' | 'gather-and-send';
//           }

//           export interface V210 extends Omit<V200, 'version'> {
//             version: '2.1.0';
//             /**
//              * @defaultValue `'default'`
//              */
//             'log-level'?:
//               | 'none'
//               | 'activity'
//               | 'header'
//               | 'payload'
//               | 'default'
//               | `$(${string})`;
//           }
//         }

//         export type MapPolicy =
//           | MapPolicy.DataPowerGateway
//           | MapPolicy.DataPowerAPIGateway;

//         export namespace MapPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface IO {
//             [key: string]: {
//               schema: {type: string} | {$ref: string};
//               variable: string;
//               content: 'application/xml' | 'application/json';
//             };
//           }

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             inputs?: MapPolicy.IO;
//             outputs?: MapPolicy.IO;
//             actions: {
//               from?: string;
//               value?: string;
//               default?: string;
//               foreach?: string;
//             } & (
//               | {
//                   set: string;
//                 }
//               | {
//                   create: string;
//                 }
//             );
//             options?: {
//               /**
//                * @defaultValue `false`
//                */
//               includeEmptyXMLElements?: boolean;
//               /**
//                * @defaultValue `true`
//                */
//               namespaceInheritance?: boolean;
//               /**
//                * @defaultValue `true`
//                */
//               inlineNamespaces?: boolean;
//               mapResolveXMLInputDataType?: boolean;
//               mapXMLEmptyElement?: 'string' | null;
//               messagesInputData?: 'error' | 'warn' | 'info';
//             };
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//             mapXMLEmptyElement?:
//               | 'string'
//               | 'null'
//               | 'string-badgerfish'
//               | 'null-badgerfish';
//             /**
//              * @defaultValue `false`
//              */
//             mapArrayFirstElementValue?: boolean;
//             /**
//              * @defaultValue `true`
//              */
//             mapResolveApicVariables?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             mapNullValue?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             mapOptimizeSchemaDefinition?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             mapEmulateV4DefaultRequiredProps?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             mapEnablePostProcessingJSON?: boolean;
//             /**
//              * @defaultValue `'all'`
//              */
//             mapCreateEmptyArray?: 'all' | 'parent' | 'none';
//             /**
//              * @remarks
//              * Valid range: 1-5
//              * @defaultValue `1`
//              */
//             mapReferenceLimit?: number;
//             /**
//              * @defaultValue `false`
//              */
//             mapEmulateV4EmptyJSONObject?: boolean;
//           }
//         }

//         export type OperationSwitchPolicy =
//           | OperationSwitchPolicy.DataPowerGateway
//           | OperationSwitchPolicy.DataPowerAPIGateway;

//         export namespace OperationSwitchPolicy {
//           export type DataPowerGateway<ET extends Execute.V100Min = Execute.DataPowerGateway> = V100<ET>;
//           export type DataPowerAPIGateway<ET extends Execute.V200Min = Execute.DataPowerAPIGateway> = V200<ET>;

//           export interface V100<ET extends Execute = Execute.V100Min> {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             case: {
//               operations: {
//                 verb?:
//                   | 'GET'
//                   | 'POST'
//                   | 'PUT'
//                   | 'DELETE'
//                   | 'HEAD'
//                   | 'PATCH'
//                   | 'OPTIONS';
//                 path?: string;
//                 operationID?: string;
//               };
//               execute: ET;
//             }[];
//           }

//           export interface V200<ET extends Execute = Execute.V200Min> extends Omit<V100, 'version' | 'execute'> {
//             version: '2.0.0';
//             execute: ET;
//           }
//         }

//         export type OAuthPolicy = OAuthPolicy.DataPowerAPIGateway;

//         export namespace OAuthPolicy {
//           export type DataPowerAPIGateway = V200;

//           export interface V200 {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             'oauth-provider-settings-ref'?: {
//               default: string;
//               url?: string;
//               literal?: string;
//             };
//             'supported-oauth-components'?: (
//               | 'OAuthGenerateAZCode'
//               | 'OAuthGenerateAccessToken'
//               | 'OAuthIntrospectToken'
//               | 'OAuthVerifyAZCode'
//               | 'OAuthVerifyRefreshToken'
//             )[];
//           }
//         }

//         export type ParsePolicy = ParsePolicy.DataPowerAPIGateway;

//         export namespace ParsePolicy {
//           export type DataPowerAPIGateway = V200;

//           export interface V200 {
//             version: string;
//             title?: string;
//             description?: string;
//             /**
//              * @defaultValue `false`
//              */
//             'use-content-type'?: boolean;
//             'parse-settings-reference'?: {
//               default?: unknown;
//               literal?: string;
//               url?: string;
//             };
//             document_type?: 'detect' | 'JSON' | 'XML' | 'graphql';
//             /**
//              * @remarks
//              * Valid range: 0-5368709121
//              * @defaultValue `0`
//              */
//             max_doc_size?: number;
//             /**
//              * @remarks
//              * Valid range: 0-4096
//              * @defaultValue `0`
//              */
//             max_nesting_depth?: number;
//             /**
//              * @remarks
//              * Valid range: 0-8192
//              * @defaultValue `0`
//              */
//             max_width?: number;
//             /**
//              * @remarks
//              * Valid range: 0-8192
//              * @defaultValue `0`
//              */
//             max_name_length?: number;
//             /**
//              * @remarks
//              * Valid range: 0-5368709121
//              * @defaultValue `0`
//              */
//             max_value_length?: number;
//             /**
//              * @remarks
//              * Valid range: 0-1048575
//              * @defaultValue `0`
//              */
//             max_unique_names?: number;
//             /**
//              * @remarks
//              * Valid range: 0-262143
//              * @defaultValue `0`
//              */
//             max_unique_prefixes?: number;
//             /**
//              * @remarks
//              * Valid range: 0-65535
//              * @defaultValue `0`
//              */
//             max_unique_namespaces?: number;
//             /**
//              * @remarks
//              * Valid range: 0-256
//              * @defaultValue `0`
//              */
//             max_number_length?: number;
//             input?: string;
//             output?: string;
//           }
//         }

//         export type ProxyPolicy = ProxyPolicy.DataPowerGateway;

//         export namespace ProxyPolicy {
//           export type DataPowerGateway = V100;

//           export interface V100 {
//             version: string;
//             title?: string;
//             description?: string;
//             'target-url'?: string;
//             'tls-profile'?: string;
//             /**
//              * @defaultVaue `'Keep'`
//              */
//             verb?:
//               | 'Keep'
//               | 'GET'
//               | 'POST'
//               | 'PUT'
//               | 'DELETE'
//               | 'PATCH'
//               | 'HEAD'
//               | 'OPTIONS';
//             /**
//              * @defaultValue `'1.1'`
//              */
//             'http-version': string;
//             /**
//              * @defaultValue `60`
//              */
//             timeout?: number;
//             /**
//              * @defaultValue: `false`
//              */
//             compression?: boolean;
//             username?: string;
//             password?: string;
//             output?: string;
//             'cache-key'?: string;
//             /**
//              * @defaultValue `'protocol'`
//              */
//             'cache-response'?: 'protocol' | 'no-cache' | 'time-to-live';
//             /**
//              * @defaultValue `false`
//              */
//             'cache-putpost-response'?: boolean;
//             /**
//              * @defaultValue '900'
//              */
//             'cache-ttl'?: number;
//             'stop-on-error'?: string[];
//           }
//         }

//         export type RateLimitPolicy = RateLimitPolicy.DataPowerAPIGateway;

//         export namespace RateLimitPolicy {
//           export type DataPowerAPIGateway = V200;

//           export type V200 = {
//             version: string;
//             title?: string;
//             description?: string;
//             source:
//               | 'catalog-named'
//               | 'plan-named'
//               | 'gateway-named'
//               | 'plan-default';
//             operation?: 'consume' | 'replenish' | 'inc' | 'dec'; // No clear documentation on this.
//           } & (
//             | {
//                 'rate-limit': string[];
//                 'burst-limit'?: string[];
//                 'count-limit'?: string[];
//               }
//             | {
//                 'rate-limit'?: string[];
//                 'burst-limit': string[];
//                 'count-limit'?: string[];
//               }
//             | {
//                 'rate-limit'?: string[];
//                 'burst-limit'?: string[];
//                 'count-limit': string[];
//               }
//           );
//         }

//         export type RedactPolicy =
//           | RedactPolicy.DataPowerGateway
//           | RedactPolicy.DataPowerAPIGateway;

//         export namespace RedactPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             actions: {
//               /**
//                * @defaultValue `'redact'`
//                */
//               action?: 'remove' | 'redact';
//               /**
//                * @defaultValue `'all'`
//                */
//               from?: ('all' | 'request' | 'response' | 'logs')[];
//               path: string;
//             }[];
//           }

//           export interface V200 extends Omit<V100, 'version' | 'actions'> {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             redactions: {
//               root?: string;
//               path: string;
//               /**
//                * @defaultValue `'redact'`
//                */
//               action?: 'redact' | 'remove';
//             }[];
//           }
//         }

//         export type SetVariablePolicy =
//           | SetVariablePolicy.DataPowerGateway
//           | SetVariablePolicy.DataPowerAPIGateway;

//         export namespace SetVariablePolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             actions:
//               | {
//                   set: string;
//                   value: string;
//                 }
//               | {
//                   add: string;
//                   value: string;
//                 }
//               | {
//                   clear: string;
//                 };
//           }

//           export interface V200 extends Omit<V100, 'version' | 'actions'> {
//             version: '2.0.0';
//             actions:
//               | {
//                   set: string;
//                   value: string;
//                   type: 'any' | 'string' | 'number' | 'boolean'; // Documentation unclear if this is needed for `clear`.
//                 }
//               | {
//                   add: string;
//                   value: string;
//                   type: 'any' | 'string' | 'number' | 'boolean';
//                 }
//               | {
//                   clear: string;
//                 };
//           }
//         }

//         export type SwitchPolicy =
//           | SwitchPolicy.DataPowerGateway
//           | SwitchPolicy.DataPowerAPIGateway;

//         export namespace SwitchPolicy {
//           export type DataPowerGateway<ET extends Execute.V100Min = Execute.DataPowerGateway> = ET extends Execute ? V100<ET> : V100;
//           export type DataPowerAPIGateway<ET extends Execute.V200Min = Execute.DataPowerAPIGateway> = ET extends Execute ? V200<ET> : V200;

//           export interface V100<ET extends Execute.V100Min = Execute.V100> {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             case: {
//               condition: string;
//               execute: ET;
//             }[];
//           }

//           export interface V200<ET extends Execute.V200Min = Execute.V200> extends Omit<V100, 'version' | 'execute'> {
//             version: '2.0.0';
//             execute: ET;
//           }
//         }

//         export type ThrowPolicy =
//           | ThrowPolicy.DataPowerGateway
//           | ThrowPolicy.DataPowerAPIGateway;

//         export namespace ThrowPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200 | V210;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             name: string;
//             message?: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//           }

//           export interface V210 extends Omit<V200, 'version'> {
//             version: '2.1.0';
//             title?: string;
//             name: string;
//             'error-status-code'?: number;
//             'error-status-reason'?: string;
//             message?: string;
//           }
//         }

//         export interface UserDefinedPolicy {
//           [policy_name: string]: {
//             [prop: string]: unknown;
//           };
//         }

//         export type UserSecurityPolicy = UserSecurityPolicy.DataPowerAPIGateway;

//         export namespace UserSecurityPolicy {
//           export type DataPowerAPIGateway = V200;

//           export type V200 = {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             'factor-id'?: string;
//           } & (
//             | ({'ei-stop-on-error'?: boolean} & (
//                 | {
//                     'extract-identity-method': 'basic';
//                   }
//                 | {
//                     'extract-identity-method': 'context-var';
//                     'user-context-var': string;
//                     'pass-context-var': string;
//                   }
//                 | ({
//                     'extract-identity-method': 'html-form';
//                     'ei-form-time-limit'?: number;
//                   } & (
//                     | {
//                         'ei-default-form': true;
//                       }
//                     | {
//                         'ei-default-form': false;
//                         'ei-custom-form': string;
//                         'ei-custom-form-tls-client-profile': string;
//                       }
//                   ))
//                 | {
//                     'extract-identity-method': 'redirect';
//                     'redirect-url': string;
//                     'redirect-time-limit': number;
//                   }
//               ))
//             | {
//                 'extract-identity-method': 'disabled';
//               }
//           ) &
//             (
//               | ({'au-stop-on-error'?: boolean} & (
//                   | {
//                       'user-auth-method': 'auth-url';
//                       'auth-url': string;
//                       'auth-tls-client-profile': string;
//                       'auth-response-headers-pattern': string;
//                       'auth-response-header-credential': string;
//                     }
//                   | {
//                       'user-auth-method': 'ldap';
//                       'ldap-registry': string;
//                     }
//                 ))
//               | {
//                   'user-auth-method': 'disabled';
//                 }
//             ) &
//             (
//               | ({'az-stop-on-error': boolean} & (
//                   | {
//                       'user-az-method': 'authenticated';
//                     }
//                   | ({
//                       'user-az-method': 'html-form';
//                     } & (
//                       | {
//                           'az-default-form': true;
//                         }
//                       | {
//                           'az-default-form': false;
//                           'az-table-dynamic-entries': string;
//                           'az-form-time-limit': number;
//                         }
//                     ))
//                 ))
//               | {
//                   'user-az-method': 'disabled';
//                 }
//             );
//         }

//         export type ValidatePolicy =
//           | ValidatePolicy.DataPowerGateway
//           | ValidatePolicy.DataPowerAPIGateway;

//         export namespace ValidatePolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title?: string;
//             description?: string;
//             definition: `#/definitions/${string}` | 'request' | 'response';
//           }

//           export type V200 = {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             input?: string;
//             output?: string;
//           } & (
//             | {
//                 'validate-against'?:
//                   | 'wsdl'
//                   | 'body-param'
//                   | 'response-param'
//                   | 'graphql';
//               }
//             | {
//                 'validate-against': 'definition';
//                 definition: string;
//               }
//             | {
//                 'validate-against': 'url';
//                 'json-schema': string;
//                 'xml-validation-mode': 'xsd' | 'wsdl' | 'soap-body';
//               }
//           );
//         }

//         export type ValidateUsernameTokenPolicy =
//           ValidateUsernameTokenPolicy.DataPowerGateway;

//         export namespace ValidateUsernameTokenPolicy {
//           export type DataPowerGateway = V100 | V110;

//           export type V100 = {
//             version: '1.0.0';
//             title: string;
//             description?: string;
//           } & (
//             | {
//                 'auth-type': 'Authentication URL';
//                 'auth-url': string;
//                 'tls-profile'?: string;
//               }
//             | {
//                 'auth-type': 'LDAP Registry';
//                 'ldap-registry': string;
//                 'ldap-search-attribute': string;
//               }
//           );

//           export type V110 = Omit<
//             V100,
//             | 'version'
//             | 'auth-type'
//             | 'auth-url'
//             | 'tls-profile'
//             | 'ldap-registry'
//           > & {
//             version: '2.0.0';
//             title: string;
//             registry: string;
//           };
//         }

//         export type WebSocketUpgradePolicy = WebSocketUpgradePolicy.DataPowerAPIGateway;

//         export namespace WebSocketUpgradePolicy {
//           export type DataPowerAPIGateway<ET extends Execute.V200Min = Execute.DataPowerAPIGateway> = V200<ET>;

//           export interface V200<ET extends Execute.V200Min = Execute.V200> {
//             version: '2.0.0';
//             title?: string;
//             description?: string;
//             target: string;
//             'tls-profile'?: string;
//             /**
//              * @defaultValue `60`
//              */
//             timeout?: number;
//             'follow-redirects'?: boolean;
//             username?: string;
//             password?: string;
//             /**
//              * @defaultValue `false`
//              */
//             'inject-proxy-headeres'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'decode-request-params'?: boolean;
//             /**
//              * @defaultValue `false`
//              */
//             'encode-plus-char'?: boolean;
//             /**
//              * @defaultValue
//              * ```typescript
//              * {
//              *   type: 'blocklist',
//              *   values: [],
//              * }
//              * ```
//              */
//             'header-control'?: {
//               type: 'blocklist' | 'allowlist';
//               values: string[];
//             };
//             /**
//              * @defaultValue
//              * ```typescript
//              * {
//              *   type: 'blocklist',
//              *   values: [],
//              * }
//              * ```
//              */
//             'parameter-control'?: {
//               type: 'blocklist' | 'allowlist';
//               values: string[];
//             };
//             'request-assembly'?: {
//               execute: Pick<
//                 ET,
//                 'parse' | 'ratelimit' | 'validate'
//               >;
//             };
//             'response-assembly'?: {
//               execute: ET;
//             };
//           }
//         }

//         export type XMLToJSONPolicy =
//           | XMLToJSONPolicy.DataPowerGateway
//           | XMLToJSONPolicy.DataPowerAPIGateway;

//         export namespace XMLToJSONPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: '1.0.0';
//             title: string;
//             description?: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//             input?: string;
//             output?: string;
//             conversionType?: 'badgerFish' | 'apicv5';
//           }
//         }

//         export type XSLTPolicy =
//           | XSLTPolicy.DataPowerGateway
//           | XSLTPolicy.DataPowerAPIGateway;

//         export namespace XSLTPolicy {
//           export type DataPowerGateway = V100;
//           export type DataPowerAPIGateway = V200;

//           export interface V100 {
//             version: string;
//             title: string;
//             description?: string;
//             /**
//              * @defaultValue `false`
//              */
//             input?: boolean;
//             source: string;
//           }

//           export interface V200 extends Omit<V100, 'version'> {
//             version: '2.0.0';
//             /**
//              * @defaultValue `false`
//              */
//             'serialize-output'?: boolean;
//           }
//         }
//       }

//       export type Catch<ET extends Assembly.Execute> =
//           | {
//               errors: string[];
//               execute: ET[];
//             }
//           | {
//               default: ET[];
//             };

//       export interface ActivityLog {
//         version: string;
//         title: string;
//         description?: string;
//         /**
//          * @defaultValue `'activity'`
//          */
//         'success-content': 'none' | 'activity' | 'header' | 'payload';
//         /**
//          * @defaultValue `'payload'`
//          */
//         'error-content': 'none' | 'activity' | 'header' | 'payload';
//         enabled?: boolean;
//       }
//     }

//     export interface Properties {
//       [prop: string]: {
//         value?: string;
//         description?: string;
//         encoded?: boolean;
//       };
//     }

//     export interface Catalogs {
//       [catalogName: string]: {
//         properties: Record<string, unknown>;
//       };
//     }
//   }
// }
// }
// }
