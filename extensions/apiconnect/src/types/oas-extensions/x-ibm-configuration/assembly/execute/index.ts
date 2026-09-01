/* eslint-disable @typescript-eslint/naming-convention */
import * as ClientSecurityPolicy from './client-security.policy';
import * as GatewayScriptPolicy from './gateway-script.policy';
import * as GraphQLIntrospectPolicy from './graphql-introspect.policy';
import * as IfPolicy from './if.policy';
import * as InvokePolicy from './invoke.policy';
import * as JSONToXMLPolicy from './json-to-xml.policy';
import * as JWTGeneratePolicy from './jwt-generate.policy';
import * as JWTValidatePolicy from './jwt-validate.policy';
import * as LogPolicy from './log.policy';
import * as LTPAGeneratePolicy from './ltpa-generate.policy';
import * as MapPolicy from './map.policy';
import * as OAuthPolicy from './oauth.policy';
import * as OperationSwitchPolicy from './operation-switch.policy';
import * as ParsePolicy from './parse.policy';
import * as ProxyPolicy from './proxy.policy';
import * as RateLimitPolicy from './rate-limit.policy';
import * as RedactPolicy from './redact.policy';
import * as SetVariablePolicy from './set-variable.policy';
import * as SwitchPolicy from './switch.policy';
import * as ThrowPolicy from './throw.policy';
import * as UserDefinedPolicy from './user-defined.policy';
import * as ValidateUsernameTokenPolicy from './validate-username-token.policy';
import * as ValidatePolicy from './validate.policy';
import * as WebSocketUpgradePolicy from './websocket-upgrade.policy';
import * as XMLToJSONPolicy from './xml-to-json.policy';
import * as XSLTPolicy from './xslt.policy';

export {
  GatewayScriptPolicy,
  IfPolicy,
  InvokePolicy,
  JWTValidatePolicy,
  MapPolicy,
  OperationSwitchPolicy,
  ProxyPolicy,
  RedactPolicy,
  SetVariablePolicy,
  SwitchPolicy,
  ThrowPolicy,
  UserDefinedPolicy,
  ValidatePolicy,
  ValidateUsernameTokenPolicy,
  XMLToJSONPolicy,
  XSLTPolicy,
  ClientSecurityPolicy,
  GraphQLIntrospectPolicy,
  JSONToXMLPolicy,
  JWTGeneratePolicy,
  LogPolicy,
  OAuthPolicy,
  RateLimitPolicy,
  WebSocketUpgradePolicy,
};

export type Execute = DataPowerGateway | DataPowerAPIGateway;

export type DataPowerGateway = V100;
export type DataPowerAPIGateway = V200 | V210 | V220 | V230;

export type V230Min = V230;
export type V220Min = V230Min | V220;
export type V210Min = V220Min | V210;
export type V200Min = V210Min | V200;
export type V100Min = V100;

export interface V100 {
  gatewayscript?: GatewayScriptPolicy.V100;
  if?: IfPolicy.V100;
  invoke?: InvokePolicy.V100;
  'jwt-validate'?: JWTValidatePolicy.V100;
  map?: MapPolicy.V100;
  'operation-switch'?: OperationSwitchPolicy.V100;
  proxy?: ProxyPolicy.V100;
  redact?: RedactPolicy.V100;
  'ltpa-generate'?: LTPAGeneratePolicy.LTPAGeneratePolicy;
  'set-variable'?: SetVariablePolicy.V100;
  switch?: SwitchPolicy.V100[];
  throw?: ThrowPolicy.V100;
  validate?: ValidatePolicy.V100;
  'validate-usernametoken'?: ValidateUsernameTokenPolicy.V100;
  'xml-to-json'?: XMLToJSONPolicy.V100;
  xslt?: XSLTPolicy.V100;
}

export interface V200 {
  'activity-log'?: {
    /**
     * @defaultValue `'activity'`
     */
    'success-content'?: 'none' | 'activity' | 'header' | 'payload';
    /**
     * @defaultValue `'payload'`
     */
    'error-content'?: 'none' | 'activity' | 'header' | 'payload';
    enabled?: boolean;
  };
  'client-security'?: ClientSecurityPolicy.V200;
  gatewayscript?: GatewayScriptPolicy.V200;
  'graphql-introspect'?: GraphQLIntrospectPolicy.V200;
  invoke?: InvokePolicy.V200;
  'json-to-xml'?: JSONToXMLPolicy.V200;
  'jwt-generate'?: JWTGeneratePolicy.V200;
  'jwt-validate'?: JWTValidatePolicy.V200;
  log?: LogPolicy.V200;
  map?: MapPolicy.V200;
  'operation-switch'?: OperationSwitchPolicy.V200;
  oauth?: OAuthPolicy.V200;
  parse?: ParsePolicy.V200;
  ratelimit?: RateLimitPolicy.V200;
  redact?: RedactPolicy.V200;
  'set-variable'?: SetVariablePolicy.V200;
  switch?: SwitchPolicy.V200[];
  throw?: ThrowPolicy.V200;
  validate?: ValidatePolicy.V200;
  'websocket-upgrade'?: WebSocketUpgradePolicy.V200[];
  'xml-to-json'?: XMLToJSONPolicy.V200;
  xslt?: XSLTPolicy.V200;
}

export interface V210
  extends Omit<V200, 'log' | 'operation-switch' | 'switch' | 'throw'> {
  log?: LogPolicy.V210;
  'operation-switch'?: OperationSwitchPolicy.V200<V210>;
  switch?: SwitchPolicy.V200<V210>[];
  throw?: ThrowPolicy.V210;
}

export interface V220
  extends Omit<V210, 'invoke' | 'operation-switch' | 'switch'> {
  invoke?: InvokePolicy.V220;
  'operation-switch'?: OperationSwitchPolicy.V200<V220>;
  switch?: SwitchPolicy.V200<V220>;
}

export interface V230
  extends Omit<V220, 'invoke' | 'operation-switch' | 'switch'> {
  invoke?: InvokePolicy.V230;
  'operation-switch'?: OperationSwitchPolicy.V200<V230>;
  switch?: SwitchPolicy.V200<V230>;
}
