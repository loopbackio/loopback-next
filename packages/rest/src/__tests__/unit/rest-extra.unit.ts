// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DEFAULT_OPENAPI_SPEC_INFO} from '@loopback/openapi-v3';
import {expect, sinon} from '@loopback/testlab';
import {
  InfoSpecEnhancer,
  RedirectRoute,
  RegExpRouter,
  RoutingTable,
  TrieRouter,
} from '../..';

// ---------------------------------------------------------------------------
// RedirectRoute
// ---------------------------------------------------------------------------

describe('RedirectRoute', () => {
  describe('isRedirectRoute()', () => {
    it('returns true for a RedirectRoute instance', () => {
      const route = new RedirectRoute('/old', '/new', 301);
      expect(RedirectRoute.isRedirectRoute(route)).to.be.true();
    });

    it('returns false for an object without targetLocation', () => {
      expect(
        RedirectRoute.isRedirectRoute({
          spec: {description: 'LoopBack Redirect route'},
        }),
      ).to.be.false();
    });

    it('returns false for an object without the correct spec description', () => {
      expect(
        RedirectRoute.isRedirectRoute({
          targetLocation: '/new',
          spec: {description: 'Other'},
        }),
      ).to.be.false();
    });

    it('returns false for null', () => {
      expect(RedirectRoute.isRedirectRoute(null)).to.be.false();
    });

    it('returns false for undefined', () => {
      expect(RedirectRoute.isRedirectRoute(undefined)).to.be.false();
    });
  });

  describe('describe()', () => {
    it('returns a human-readable route description', () => {
      const route = new RedirectRoute('/source', '/target', 302);
      expect(route.describe()).to.equal('Redirect: "/source" => "/target"');
    });
  });

  describe('updateBindings()', () => {
    it('is a no-op (does not throw)', () => {
      const route = new RedirectRoute('/old', '/new');
      const fakeCtx = {response: {redirect: () => {}}} as never;
      expect(() => route.updateBindings(fakeCtx)).to.not.throwError();
    });
  });

  describe('invokeHandler()', () => {
    it('calls response.redirect with statusCode and targetLocation', async () => {
      const route = new RedirectRoute('/old', '/new', 301);
      const redirectSpy = sinon.stub();
      const fakeCtx = {response: {redirect: redirectSpy}} as never;
      await route.invokeHandler(fakeCtx, []);
      sinon.assert.calledOnceWithExactly(redirectSpy, 301, '/new');
    });
  });
});

// ---------------------------------------------------------------------------
// RoutingTable — no external routes (throws NotFound instead of delegating)
// ---------------------------------------------------------------------------

describe('RoutingTable without external routes', () => {
  it('throws NotFound when no route matches and no external routes exist', () => {
    const table = new RoutingTable(new TrieRouter());
    const request = {method: 'GET', path: '/unknown'} as never;
    expect(() => table.find(request)).to.throwError(/not found/i);
  });

  it('throws NotFound for RegExpRouter as well', () => {
    const table = new RoutingTable(new RegExpRouter());
    const request = {method: 'GET', path: '/also-unknown'} as never;
    expect(() => table.find(request)).to.throwError(/not found/i);
  });
});

// ---------------------------------------------------------------------------
// InfoSpecEnhancer — parseAuthor branches
// ---------------------------------------------------------------------------

describe('InfoSpecEnhancer', () => {
  const defaultSpec = {
    openapi: '3.0.0',
    info: {
      title: DEFAULT_OPENAPI_SPEC_INFO.title,
      version: DEFAULT_OPENAPI_SPEC_INFO.version,
    },
    paths: {},
  };

  it('skips enhancing when pkg metadata is not set (null)', () => {
    const enhancer = new InfoSpecEnhancer(undefined);
    const result = enhancer.modifySpec(defaultSpec);
    expect(result).to.deepEqual(defaultSpec);
  });

  it('uses pkg.name when metadata is provided and info is default', () => {
    const enhancer = new InfoSpecEnhancer({
      name: 'my-app',
      version: '2.0.0',
      description: 'My App',
    });
    const result = enhancer.modifySpec(defaultSpec);
    expect(result.info.title).to.equal('my-app');
    expect(result.info.version).to.equal('2.0.0');
  });

  it('keeps existing title/version when info is custom', () => {
    const enhancer = new InfoSpecEnhancer({
      name: 'my-app',
      version: '2.0.0',
    });
    const customSpec = {
      ...defaultSpec,
      info: {title: 'Custom Title', version: '9.9.9'},
    };
    const result = enhancer.modifySpec(customSpec);
    expect(result.info.title).to.equal('Custom Title');
    expect(result.info.version).to.equal('9.9.9');
  });

  it('parses a string author field', () => {
    const enhancer = new InfoSpecEnhancer({
      name: 'my-app',
      version: '1.0.0',
      author: 'Jane Doe <jane@example.com> (https://example.com)',
    });
    const result = enhancer.modifySpec(defaultSpec);
    expect(result.info.contact).to.containEql({
      name: 'Jane Doe',
      email: 'jane@example.com',
      url: 'https://example.com',
    });
  });

  it('parses an object author field', () => {
    const enhancer = new InfoSpecEnhancer({
      name: 'my-app',
      version: '1.0.0',
      author: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        url: 'https://example.com',
      },
    });
    const result = enhancer.modifySpec(defaultSpec);
    expect(result.info.contact).to.containEql({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('handles null author field gracefully', () => {
    const enhancer = new InfoSpecEnhancer({
      name: 'my-app',
      version: '1.0.0',
      author: null,
    });
    const result = enhancer.modifySpec(defaultSpec);
    // null author → empty contact (no error thrown)
    expect(result.info.title).to.equal('my-app');
  });
});
