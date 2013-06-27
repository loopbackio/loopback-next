import {DeclarationReflection} from 'typedoc';
import {
  Comment,
  Reflection,
  Type,
  UnionType,
  ReferenceType,
  ArrayType,
  ParameterReflection,
  SignatureReflection,
  IntrinsicType,
  UnknownType,
  ReflectionType,
} from 'typedoc/dist/lib/models';
import {Annotation} from './annotation';
import {
  ReflectionFlags,
  ReflectionKind,
} from 'typedoc/dist/lib/models/reflections/abstract';

// tslint:disable-next-line:no-any
export type AnyObject<T = any> = {
  [name: string]: T;
};

export type Options = AnyObject;

export interface Node extends DeclarationReflection {
  filename?: string;
  tsHelpers?: TSHelper;
  comment_copy?: Comment;
  anchorId?: string;
  shouldDocument?: boolean;
}

export interface Section {
  title: string;
  anchor?: string;
  depth: number;
  annotation?: Annotation;
}

function getType(type: Type) {
  if (type.type === 'reference') {
    const ref = type as ReferenceType;
    return '<a href="#' + ref.name + '">' + ref.name + '</a>';
  } else if (type.type === 'reflection') {
    return 'anonymous';
  } else {
    const t = type as IntrinsicType | UnknownType;
    return t.name || '';
  }
}

function getTypeArguments(type: ReferenceType) {
  if (Array.isArray(type.typeArguments)) {
    let typeArgs: string[] = [];
    type.typeArguments.forEach(function(typeArg) {
      typeArgs.push(TSHelper.getTypeStr(typeArg));
    });
    return '&lt;' + typeArgs.join(', ') + '&gt;';
  } else {
    return '';
  }
}

function getUnionType(type: UnionType) {
  if (type.type === 'union') {
    if (Array.isArray(type.types)) {
      let unionTypes: string[] = [];
      type.types.forEach(function(unionType) {
        unionTypes.push(TSHelper.getTypeStr(unionType));
      });
      return unionTypes.join(' | ');
    }
  }
  return '';
}

function getArrayType(type: ArrayType) {
  if (type.type === 'array') {
    let elementType = TSHelper.getTypeStr(type.elementType);
    if (elementType.indexOf('|') !== -1) {
      // Element type is a union type
      return '(' + elementType + ')[]';
    } else {
      return elementType + '[]';
    }
  }
  return '';
}

export class TSHelper {
  static getTypeStr(type: Type) {
    let typeStr = '';
    if (type == null) return typeStr;
    let typeArguments = getTypeArguments(type as ReferenceType);
    if (type.type === 'array') {
      typeStr = getArrayType(type as ArrayType) + typeArguments;
    } else if (type.type === 'union') {
      typeStr = getUnionType(type as UnionType) + typeArguments;
    } else {
      typeStr = getType(type) + typeArguments;
    }
    return typeStr;
  }

  static commaSepParams(params?: ParameterReflection[]) {
    let args: string[] = [];
    params = params || undefined;
    if (params && params.length > 0) {
      params.forEach(function(param) {
        let arg = '';
        if (param.type.type === 'reflection') {
          arg = TSHelper.getSignatureForFunction(param);
        } else {
          arg = param.name + ': ' + TSHelper.getTypeStr(param.type);
        }
        args.push(arg);
      });
    }
    return args.join(', ');
  }

  static getSignatureForFunction(param: ParameterReflection) {
    const paramType = param.type as ReflectionType;
    let signatures: SignatureReflection[] = paramType.declaration.signatures;
    if (signatures && signatures[0]) {
      return (
        param.name +
        ': ' +
        '(' +
        TSHelper.commaSepParams(signatures[0].parameters) +
        ') => ' +
        TSHelper.getTypeStr(signatures[0].type)
      );
    } else {
      return param.name;
    }
  }

  /**
   * Get flags as a string
   *
   * - Private
   * - Protected
   * - Static
   * - ExportAssignment
   * - Optional
   * - DefaultValue
   * - Rest
   * - Abstract
   * - Let
   * - Const
   *
   * @param {*} flags
   */
  static getFlags(flags: ReflectionFlags) {
    flags = flags || {};
    let names = [];
    for (let f in flags) {
      if (flags[f]) {
        if (f.indexOf('is') === 0) {
          f = f.substr(2);
          f = f[0].toLowerCase() + f.substr(1);
        }
        names.push(f);
      }
    }
    return names.join(' ');
  }

  /**
   * Get variable type as Const/Let/Variable
   * @param {*} varNode
   */
  static getVariableType(varNode: Reflection) {
    let kind = 'var';
    if (varNode.flags) {
      if (varNode.flags.isConst) kind = 'const';
      if (varNode.flags.isLet) kind = 'let';
    }
    return kind;
  }

  static getVariableStr(varNode: Node) {
    let kind = TSHelper.getVariableType(varNode);
    let type = TSHelper.getTypeStr(varNode.type);
    let defaultVal = varNode.defaultValue;
    let str = kind + ' ' + varNode.name;
    str = type ? str + ': ' + type : str;
    str = defaultVal !== undefined ? str + ' = ' + defaultVal : str;
    return str;
  }

  static shouldDocument(node: Node) {
    if (node && node.shouldDocument === false) {
      return false;
    } else {
      return true;
    }
  }

  static getNodeTitle(node: Node) {
    let type = node.kindString;
    const kind = node.kind;
    if (kind === ReflectionKind.Module) type = 'Namespace';
    if (kind === ReflectionKind.Enum) type = 'Enum';
    if (kind === ReflectionKind.EnumMember) type = '';
    if (kind === ReflectionKind.TypeAlias) type = 'Type';
    if (kind === ReflectionKind.ObjectLiteral) type = 'Object';
    let prefix = '';
    if (kind === ReflectionKind.Method || kind === ReflectionKind.Property) {
      if (node.flags.isStatic) {
        prefix = 'static ';
      }
    }
    if (
      kind === ReflectionKind.Method ||
      kind === ReflectionKind.Constructor ||
      kind === ReflectionKind.Function
    )
      return prefix + node.name + '()';
    if (kind === ReflectionKind.Accessor) return '>' + node.name;
    if (kind === ReflectionKind.Variable || kind === ReflectionKind.Property)
      return prefix + node.name;
    if (!type) return node.name;
    return type + ': ' + node.name;
  }
}
