// Copyright IBM Corp. 2026. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {RepositoryBindings, RepositoryTags} from '../../keys';

describe('Repository Keys and Tags', () => {
  describe('RepositoryTags', () => {
    it('defines MODEL tag', () => {
      expect(RepositoryTags.MODEL).to.equal('model');
    });

    it('defines REPOSITORY tag', () => {
      expect(RepositoryTags.REPOSITORY).to.equal('repository');
    });

    it('defines DATASOURCE tag', () => {
      expect(RepositoryTags.DATASOURCE).to.equal('datasource');
    });

    it('has exactly 3 tags', () => {
      const tags = Object.keys(RepositoryTags);
      expect(tags).to.have.length(3);
    });

    it('all tags are strings', () => {
      expect(RepositoryTags.MODEL).to.be.a.String();
      expect(RepositoryTags.REPOSITORY).to.be.a.String();
      expect(RepositoryTags.DATASOURCE).to.be.a.String();
    });

    it('tags are unique', () => {
      const tags = [
        RepositoryTags.MODEL,
        RepositoryTags.REPOSITORY,
        RepositoryTags.DATASOURCE,
      ];
      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).to.equal(tags.length);
    });

    it('tags are lowercase', () => {
      expect(RepositoryTags.MODEL).to.equal(RepositoryTags.MODEL.toLowerCase());
      expect(RepositoryTags.REPOSITORY).to.equal(
        RepositoryTags.REPOSITORY.toLowerCase(),
      );
      expect(RepositoryTags.DATASOURCE).to.equal(
        RepositoryTags.DATASOURCE.toLowerCase(),
      );
    });
  });

  describe('RepositoryBindings', () => {
    it('defines MODELS namespace', () => {
      expect(RepositoryBindings.MODELS).to.equal('models');
    });

    it('defines REPOSITORIES namespace', () => {
      expect(RepositoryBindings.REPOSITORIES).to.equal('repositories');
    });

    it('defines DATASOURCES namespace', () => {
      expect(RepositoryBindings.DATASOURCES).to.equal('datasources');
    });

    it('has exactly 3 namespaces', () => {
      const namespaces = Object.keys(RepositoryBindings);
      expect(namespaces).to.have.length(3);
    });

    it('all namespaces are strings', () => {
      expect(RepositoryBindings.MODELS).to.be.a.String();
      expect(RepositoryBindings.REPOSITORIES).to.be.a.String();
      expect(RepositoryBindings.DATASOURCES).to.be.a.String();
    });

    it('namespaces are unique', () => {
      const namespaces = [
        RepositoryBindings.MODELS,
        RepositoryBindings.REPOSITORIES,
        RepositoryBindings.DATASOURCES,
      ];
      const uniqueNamespaces = new Set(namespaces);
      expect(uniqueNamespaces.size).to.equal(namespaces.length);
    });

    it('namespaces are lowercase', () => {
      expect(RepositoryBindings.MODELS).to.equal(
        RepositoryBindings.MODELS.toLowerCase(),
      );
      expect(RepositoryBindings.REPOSITORIES).to.equal(
        RepositoryBindings.REPOSITORIES.toLowerCase(),
      );
      expect(RepositoryBindings.DATASOURCES).to.equal(
        RepositoryBindings.DATASOURCES.toLowerCase(),
      );
    });

    it('namespaces are plural forms', () => {
      expect(RepositoryBindings.MODELS).to.match(/s$/);
      expect(RepositoryBindings.REPOSITORIES).to.match(/s$/);
      expect(RepositoryBindings.DATASOURCES).to.match(/s$/);
    });
  });

  describe('Tags and Bindings relationship', () => {
    it('MODEL tag matches MODELS namespace pattern', () => {
      expect(RepositoryBindings.MODELS).to.match(
        new RegExp(RepositoryTags.MODEL),
      );
    });

    it('DATASOURCE tag matches DATASOURCES namespace pattern', () => {
      expect(RepositoryBindings.DATASOURCES).to.match(
        new RegExp(RepositoryTags.DATASOURCE),
      );
    });

    it('tags and namespaces have same count', () => {
      const tagCount = Object.keys(RepositoryTags).length;
      const namespaceCount = Object.keys(RepositoryBindings).length;
      expect(tagCount).to.equal(namespaceCount);
    });
  });

  describe('Usage patterns', () => {
    it('can be used to construct binding keys', () => {
      const modelKey = `${RepositoryBindings.MODELS}.User`;
      expect(modelKey).to.equal('models.User');
    });

    it('can be used to construct repository binding keys', () => {
      const repoKey = `${RepositoryBindings.REPOSITORIES}.UserRepository`;
      expect(repoKey).to.equal('repositories.UserRepository');
    });

    it('can be used to construct datasource binding keys', () => {
      const dsKey = `${RepositoryBindings.DATASOURCES}.db`;
      expect(dsKey).to.equal('datasources.db');
    });

    it('tags can be used for filtering bindings', () => {
      const tag = RepositoryTags.MODEL;
      expect(tag).to.be.a.String();
      // In real usage: context.findByTag(tag)
    });
  });
});

// Made with Bob
