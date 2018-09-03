// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Handler, ExecutionContext, asRunnable} from './handler';
import {Phase} from './phase';
import {mergePhaseNameLists as zipMerge} from './merge-name-lists';
const debug = require('debug')('loopback:phase');
/**
 * An ordered list of phases.
 */
export class PhaseList {
  /**
   * Regular phases
   */
  public readonly phases: Phase[];

  /**
   * The error phase will be executed when an error is thrown during the regular
   * phases. It's similar as the `catch` clause.
   */
  public readonly errorPhase: Phase;
  /**
   * The final phase will be always executed after regular or error phases.
   * It's similar as the `finally` clause.
   */
  public readonly finalPhase: Phase;

  /**
   * Mapping phases by name
   */
  private _phaseMap: {[name: string]: Phase};

  /**
   * Cache for handlers
   */
  private _handlers: Handler[] | undefined;

  public static readonly ERROR_PHASE = '$error';
  public static readonly FINAL_PHASE = '$final';

  constructor(phases: string[] = []) {
    this.phases = [];
    this._phaseMap = {};
    this.addAll(...phases);
    this.errorPhase = new Phase({
      id: PhaseList.ERROR_PHASE,
      parallel: false,
      failFast: false,
    });
    this.finalPhase = new Phase({
      id: PhaseList.FINAL_PHASE,
      parallel: false,
      failFast: true,
    });
    this._phaseMap[this.errorPhase.id] = this.errorPhase;
    this._phaseMap[this.finalPhase.id] = this.finalPhase;
  }

  /**
   * Get the first `Phase` in the list.
   *
   * @returns The first phase.
   */
  first(): Phase {
    return this.phases[0];
  }

  /**
   * Get the last `Phase` in the list.
   *
   * @returns The last phase.
   */
  last(): Phase {
    return this.phases[this.phases.length - 1];
  }

  /**
   * Add one or more phases to the list.
   *
   * @param phase The phases to be added.
   * @returns The added phases.
   */
  addAll(...phases: (string | Phase)[]) {
    const added: Phase[] = [];
    for (const phase of phases) {
      const p = this._resolveNameAndAddToMap(phase);
      added.push(p);
      this.phases.push(p);
    }
    return added;
  }

  /**
   * Add one phase to the list
   * @param phase The phase to be added
   */
  add(phase: string | Phase) {
    return this.addAll(phase)[0];
  }

  private _resolveNameAndAddToMap(phaseOrName: string | Phase) {
    let phase: Phase;

    if (typeof phaseOrName === 'string') {
      phase = new Phase(phaseOrName);
    } else {
      phase = phaseOrName;
    }

    if (phase.id in this._phaseMap) {
      throw new Error(util.format('Phase "%s" already exists.', phase.id));
    }

    this._phaseMap[phase.id] = phase;
    return phase;
  }

  /**
   * Add a new phase at the specified index.
   * @param index The zero-based index.
   * @param phase The name of the phase to add.
   * @returns The added phase.
   */
  addAt(index: number, phase: string | Phase) {
    phase = this._resolveNameAndAddToMap(phase);
    this.phases.splice(index, 0, phase);
    return phase;
  }

  /**
   * Add a new phase as the next one after the given phase.
   * @param after The referential phase.
   * @param phase The name of the phase to add.
   * @returns The added phase.
   */
  addAfter(after: string, phase: string | Phase) {
    const ix = this.getPhaseNames().indexOf(after);
    if (ix === -1) {
      throw new Error(util.format('Unknown phase: %s', after));
    }
    return this.addAt(ix + 1, phase);
  }

  /**
   * Add a new phase as the previous one before the given phase.
   * @param before The referential phase.
   * @param phase The name of the phase to add.
   * @returns The added phase.
   */
  addBefore(before: string, phase: string | Phase) {
    const ix = this.getPhaseNames().indexOf(before);
    if (ix === -1) {
      throw new Error(util.format('Unknown phase: %s', before));
    }
    return this.addAt(ix, phase);
  }

  /**
   * Remove a `Phase` from the list.
   *
   * @param phase The phase to be removed.
   * @returns The removed phase.
   */
  remove(phase: string | Phase) {
    const phases = this.phases;
    const phaseMap = this._phaseMap;
    let phaseId: string;

    if (!phase) return null;

    if (typeof phase === 'string') {
      phaseId = phase;
      phase = phaseMap[phaseId];
    } else {
      phaseId = phase.id;
    }

    if (!phase) return null;

    phases.splice(phases.indexOf(phase), 1);
    delete this._phaseMap[phaseId];

    return phase;
  }

  /**
   * Merge the provided list of names with the existing phases
   * in such way that the order of phases is preserved.
   *
   * **Example**
   *
   * ```ts
   * // Initial list of phases
   * phaseList.addAll('initial', 'session', 'auth', 'routes', 'files', 'final');
   *
   * // zip-merge more phases
   * phaseList.zipMerge([
   *   'initial', 'postinit', 'preauth', 'auth',
   *   'routes', 'subapps', 'final', 'last'
   * ]);
   *
   * // print the result
   * console.log('Result:', phaseList.getPhaseNames());
   * // Result: [
   * //   'initial', 'postinit', 'preauth', 'session', 'auth',
   * //   'routes', 'subapps', 'files', 'final', 'last'
   * // ]
   * ```
   *
   * @param names List of phase names to zip-merge
   */
  zipMerge(names: string[]) {
    if (!names.length) return;

    const mergedNames = zipMerge(this.getPhaseNames(), names);
    const merged = mergedNames.map(name => {
      const phase = this.find(name);
      return phase ? phase : this._resolveNameAndAddToMap(name);
    });
    this.phases.splice(0, this.phases.length);
    this.phases.push(...merged);
  }

  /**
   * Find a `Phase` from the list.
   *
   * @param id The phase identifier
   * @returns The `Phase` with the given `id`.
   */
  find(id: string) {
    return this._phaseMap[id] || null;
  }

  /**
   * Find or add a `Phase` from/into the list.
   *
   * @param id The phase identifier
   * @returns The `Phase` with the given `id`.
   */
  findOrAdd(id: string): Phase {
    const phase = this.find(id);
    if (phase) return phase;
    return this.add(id);
  }

  /**
   * Run the handlers contained in the list phase by phase.
   *
   * @param ctx The context of each `Phase` handler.
   */
  async run(ctx: ExecutionContext = {}) {
    const handlers: Handler[] = this.getHandlers();
    try {
      debug('Running regular phases');
      await asRunnable(handlers)(ctx);
      debug('Regular phases finished');
    } catch (e) {
      debug('Error caught:', e);
      ctx.error = e;
      debug('Running error phase');
      await this.errorPhase.run(ctx);
      debug('Error phase finished');
    } finally {
      debug('Running final phase');
      await this.finalPhase.run(ctx);
      debug('Final phase finished');
    }
  }

  private getHandlers() {
    if (this._handlers) return this._handlers;
    const handlers: Handler[] = (this._handlers = []);
    for (const p of this.phases) {
      handlers.push(...p.getHandlers());
    }
    return handlers;
  }

  /**
   * Get an array of phase identifiers.
   * @returns phaseNames
   */
  getPhaseNames(): string[] {
    return this.phases.map(p => p.id);
  }

  /**
   * Register a phase handler for the given phase (and sub-phase).
   *
   * **Example**
   *
   * ```js
   * // register via phase.use()
   * phaseList.registerHandler('routes', async (ctx, chain) => { //... });
   * // register via phase.before()
   * phaseList.registerHandler('auth:before', async (ctx, chain) => { //... });
   * // register via phase.after()
   * phaseList.registerHandler('auth:after', async (ctx, chain) => { //... });
   * ```
   *
   * @param phaseName Name of an existing phase, optionally with
   *   ":before" or ":after" suffix.
   * @param handler The handler function to register
   *   with the given phase.
   */
  registerHandler(phaseName: string, handler: Handler) {
    let subphase: 'use' | 'before' | 'after' = 'use';
    const m = phaseName.match(/^(.+):(before|after)$/);
    if (m) {
      phaseName = m[1];
      subphase = m[2] as 'use' | 'before' | 'after';
    }
    const phase = this.find(phaseName);
    if (!phase) throw new Error(util.format('Unknown phase %s', phaseName));
    phase[subphase](handler);
  }
}
