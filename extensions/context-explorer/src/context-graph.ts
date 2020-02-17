// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  ContextTags,
  JSONArray,
  JSONObject,
} from '@loopback/context';
import {attribute, digraph, ICluster, IContext} from 'ts-graphviz';

/**
 * A wrapper class for context, binding, and its level in the chain
 */
export class ContextBinding {
  public readonly id: string;
  constructor(
    public readonly context: JSONObject,
    public readonly binding: JSONObject,
    public readonly level: number,
  ) {
    const keys = Object.keys(this.context.bindings as JSONObject);
    const index = keys.indexOf(this.binding.key as string);
    this.id = `Binding_${this.level}_${index}`;
  }
}

/**
 * A filter function to control if a binding is to be rendered
 */
export type BindingNodeFilter = (binding: ContextBinding) => boolean;

/**
 * Options for ContextGraph
 */
export type ContextGraphOptions = {
  /**
   * A filter function to select bindings for rendering
   */
  bindingFilter?: BindingNodeFilter;
};

/**
 * A graph for context hierarchy
 */
export class ContextGraph {
  /**
   * Context json objects in the chain from root to leaf
   */
  private readonly contextChain: JSONObject[] = [];
  /**
   * Tag indexes for the context chain
   */
  private readonly tagIndexes: Record<string, ContextBinding[]>[] = [];

  constructor(
    ctx: JSONObject,
    private readonly options: ContextGraphOptions = {},
  ) {
    let current: JSONObject | undefined = ctx;
    while (current != null) {
      this.contextChain.unshift(current);
      current = current.parent as JSONObject | undefined;
    }
    this.indexBindings();
  }

  /**
   * Assign a unique id for each bindings
   */
  private indexBindings() {
    for (let level = 0; level < this.contextChain.length; level++) {
      const ctx = this.contextChain[level];
      this.tagIndexes[level] = {};
      const bindings = ctx.bindings as JSONObject;
      for (const key in bindings) {
        const binding = bindings[key] as JSONObject;
        const tagNames = Object.keys((binding.tags ?? {}) as JSONObject);
        for (const t of tagNames) {
          let tagged = this.tagIndexes[level][t];
          if (tagged == null) {
            tagged = [];
            this.tagIndexes[level][t] = tagged;
          }
          tagged.push(new ContextBinding(ctx, binding, level));
        }
      }
    }
  }

  /**
   * Recursive render the chain of contexts as subgraphs
   * @param parent - Parent subgraph
   * @param level - Level of the context in the chain
   */
  private renderContextChain(parent: ICluster<string>, level: number) {
    const ctx = this.contextChain[level];
    const ctxName = ctx.name as string;
    const subgraph = parent.createSubgraph(`cluster_${ctxName}`);

    subgraph.apply({
      [attribute.label]: ctxName,
      [attribute.labelloc]: 't',
    });

    const bindings = ctx.bindings as JSONObject;
    for (const key in bindings) {
      const binding = bindings[key] as JSONObject;
      const ctxBinding = new ContextBinding(ctx, binding, level);
      if (
        typeof this.options.bindingFilter === 'function' &&
        !this.options.bindingFilter(ctxBinding)
      )
        continue;
      this.renderBinding(subgraph, ctxBinding);
      this.renderBindingInjections(subgraph, ctxBinding);
      this.renderConfig(subgraph, ctxBinding);
    }

    if (level + 1 < this.contextChain.length) {
      this.renderContextChain(subgraph, level + 1);
    }

    return subgraph;
  }

  /**
   * Create an edge for a binding to its configuration
   * @param binding - Binding object
   * @param level - Context level
   */
  protected renderConfig(
    parent: ICluster<string>,
    {binding, level, id}: ContextBinding,
  ) {
    const tagMap = binding.tags as JSONObject;
    if (tagMap?.[ContextTags.CONFIGURATION_FOR]) {
      const targetBinding = this.getBinding(
        tagMap[ContextTags.CONFIGURATION_FOR] as string,
        level,
      );
      if (targetBinding != null) {
        return parent.createEdge(targetBinding.id, id).attributes.apply({
          [attribute.style]: 'dashed',
          [attribute.arrowhead]: 'odot',
          [attribute.color]: 'orange',
        });
      }
    }
    return undefined;
  }

  /**
   * Render a binding object
   * @param parent - Parent subgraph
   * @param binding - Context Binding object
   */
  protected renderBinding(
    parent: ICluster<string>,
    {binding, id}: ContextBinding,
  ) {
    let style = `filled,rounded`;
    if (binding.scope === BindingScope.SINGLETON) {
      style = style + ',bold';
    }
    const tags = binding.tags as JSONObject;
    const tagPairs: string[] = [];
    if (tags) {
      for (const t in tags) {
        tagPairs.push(`${t}:${tags[t]}`);
      }
    }
    const tagLabel = tagPairs.length ? `|${tagPairs.join('\\l')}\\l` : '';
    const label = `{${binding.key}|{${binding.type}|${binding.scope}}${tagLabel}}`;

    return parent.createNode(id).attributes.apply({
      [attribute.label]: label,
      [attribute.shape]: 'record',
      [attribute.style]: style,
      [attribute.fillcolor]: 'cyan3',
    });
  }

  /**
   * Find the binding id by key
   * @param key - Binding key
   * @param level - Context level
   */
  private getBinding(key: string, level: number) {
    for (let i = level; i >= 0; i--) {
      const ctx = this.contextChain[i];
      const bindings = ctx.bindings as JSONObject;
      key = key.split('#')[0];
      const binding = bindings?.[key] as JSONObject;
      if (binding) return new ContextBinding(ctx, binding, i);
    }
    return undefined;
  }

  /**
   * Find bindings by tag
   * @param tag - Tag name
   * @param level - Context level
   */
  private getBindingsByTag(tag: string, level: number) {
    const bindings: ContextBinding[] = [];
    for (let i = level; i >= 0; i--) {
      const tagIndex = this.tagIndexes[i];
      let tagged = tagIndex[tag];
      if (tagged != null) {
        // Exclude bindings if their keys are already in the list
        tagged = tagged.filter(
          ctxBinding =>
            !bindings.some(
              existing => existing.binding.key === ctxBinding.binding.key,
            ),
        );
        bindings.push(...tagged);
      }
    }
    return bindings;
  }

  /**
   * Render injections for a binding
   * @param parent - Parent subgraph
   * @param binding - Binding object
   * @param level - Context level
   */
  private renderBindingInjections(
    parent: ICluster<string>,
    {binding, level, id}: ContextBinding,
  ) {
    const targetBindings: string[] = [];
    const ctor = binding.valueConstructor ?? binding.providerConstructor;
    if (ctor) {
      const bindingFilter = this.options?.bindingFilter ?? (() => true);
      const injections = [];
      // For singletons, search this level and up
      const startingLevel =
        binding.scope === BindingScope.SINGLETON
          ? level
          : this.contextChain.length - 1;
      if (binding.injections) {
        const args = (binding.injections as JSONObject)
          .constructorArguments as JSONArray;
        const props = (binding.injections as JSONObject)
          .properties as JSONObject;
        if (args) {
          let i = 0;
          args.forEach(arg => {
            injections.push(`[${i++}]`);
            const argInjection = arg as JSONObject;
            const targetIds = this.getBindingsForInjection(
              argInjection,
              startingLevel,
            )
              .filter(bindingFilter)
              .map(b => b.id);
            targetBindings.push(...targetIds);
          });
        }
        if (props) {
          for (const p in props) {
            injections.push(`${p}`);
            const propInjection = props[p] as JSONObject;
            const targetIds = this.getBindingsForInjection(
              propInjection,
              startingLevel,
            )
              .filter(bindingFilter)
              .map(b => b.id);
            targetBindings.push(...targetIds);
          }
        }
      }
      let label = ctor as string;
      if (injections.length) {
        label += '|{' + injections.join('|') + '}';
      }

      // FIXME(rfeng): We might have classes with the same name
      const classId = `Class_${ctor}`;
      const rootGraph = getRootGraph(parent)!;
      const node = rootGraph.createNode(classId);
      node.attributes.apply({
        [attribute.label]: label,
        [attribute.style]: 'filled',
        [attribute.shape]: 'record',
        [attribute.fillcolor]: 'khaki',
      });

      parent
        .createEdge(id, classId)
        .attributes.apply({[attribute.style]: 'dashed'});

      for (const b of targetBindings) {
        parent
          .createEdge(classId, b)
          .attributes.apply({[attribute.color]: 'blue'});
      }
    }
  }

  /**
   * Find target bindings for an injection
   * @param injection - Injection object
   * @param level - Context level
   */
  private getBindingsForInjection(injection: JSONObject, level: number) {
    if (injection.bindingKey) {
      const binding = this.getBinding(injection.bindingKey as string, level);
      return binding == null ? [] : [binding];
    }
    if (typeof injection.bindingTagPattern === 'string') {
      const bindings = this.getBindingsByTag(
        injection.bindingTagPattern as string,
        level,
      );
      return bindings;
    }
    return [];
  }

  /**
   * Build a direct graph
   */
  build() {
    const graph = digraph('ContextGraph');
    this.renderContextChain(graph, 0);
    return graph;
  }

  /**
   * Render the context graph in graphviz dot format
   */
  render() {
    return this.build().toDot();
  }
}

/**
 * Find the root graph for the given subgraph
 * @param g - Subgraph
 */
function getRootGraph(g: ICluster<string>) {
  let current: ICluster<string> | IContext = g;
  while (isICluster(current) && current.context != null) {
    current = current.context;
  }
  return !isICluster(current) ? current.root : undefined;
}

function isICluster(g: ICluster<string> | IContext): g is ICluster<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (g as any).context != null;
}
