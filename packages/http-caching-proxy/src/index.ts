// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A caching HTTP proxy for integration tests.
 *
 * @remarks
 * **NOT SUITABLE FOR PRODUCTION USE!**
 *
 * Testing applications connecting to backend REST/SOAP services can be
 * difficult: The backend service may be slow, apply rate limiting, etc.
 * Integration tests become too slow in such case, which makes test-first
 * development impractical.
 *
 * This can be addressed by setting up a snapshot-based mock server or using a
 * caching HTTP client, but both of these solutions come with severe
 * disadvantages:
 *
 * - When using a snapshot-based mock server, we must ensure that snapshots are
 *   up-to-date with the actual backend implementation.
 * - Caching at HTTP-client side requires non-trivial changes of the application
 *   code.
 *
 * A filesystem-backed caching HTTP proxy offers a neat solution that combines
 * caching and snapshots:
 *
 * - The first request is forwarded to the actual backend and the response is
 *   stored as a snapshot.
 * - Subsequent requests are served by the proxy using the cached snaphost.
 * - Snapshot older than a configured time are discarded and the first next
 *   request will fetch the real response from the backend.
 *
 * @packageDocumentation
 */

export * from './http-caching-proxy';
