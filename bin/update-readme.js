// This file currently only updates the contributors list in the monorepo's
// README.md file.

'use strict';

const https = require('https');
const path = require('path');
const fs = require('fs');
const util = require('util');

const ALLCONTRIBUTORSRC_BASE = {
  "projectName": "loopback-next",
  "projectOwner": "strongloop",
  "repoType": "github",
  "repoHost": "https://github.com",
  "files": [
    "README.md"
  ],
  "imageSize": 100,
  "contributorsPerLine": 10,
  "contributorsSortAlphabetically": true,
  "badgeTemplate": "[![All Contributors](https://img.shields.io/badge/all_contributors-<%= contributors.length %>-orange.svg)](#contributors)",
  "contributorTemplate": "<a href=\"<%= contributor.profile %>\"><img src=\"<%= contributor.avatar_url %>\" width=\"<%= options.imageSize %>px;\" alt=\"\"/></a>",
  "commit": true,
  "commitConvention": "angular",
  "contributors": []
}

const PROJECT_ROOT = path.resolve(__dirname, '../');

const MAINTAINERS_FILEPATH = path.resolve(PROJECT_ROOT, './MAINTAINERS.md');
const ALLCONTRIBUTORSRC_FILEPATH = path.resolve(PROJECT_ROOT, './.all-contributorsrc');

async function getContributors(contributorExclusions) {
  const GITHUB_API_REPO_CONTRIBUTORS = 'https://api.github.com/repos/strongloop/loopback-next/contributors';
  const GITHUB_API_OPTIONS = {
    headers: {
      'User-Agent': 'StrongLoop',
    }
  };

  let contributors = [];

  let repoApiResponse = await new Promise((resolve, reject) => {
    let response = '';

    https.request(GITHUB_API_REPO_CONTRIBUTORS, GITHUB_API_OPTIONS, res => {
      res
        .on('data', chunk => {
          response.push(chunk.toString());
        })
        .on('end', () => {
          resolve(response);
        });
    })
      .on('error', err => reject(err));
  });

  for (const contributor of repoApiResponse) {
    if (contributorExclusions.includes(contributor.login))
      continue;

    let contributorApiResponse = await new Promise((resolve, reject) => {
      https.request(contributor.url, GITHUB_API_OPTIONS, res => {
        res.on('data', data => {
          resolve(data);
        });
      }).on('error', err => reject(err));
    });

    contributors.push({
      login: contributor.login,
      name: contributorApiResponse.name,
      profileURL: contributor.html_url,
      avatarURL: contributor.avatar_url,
    });
  }

  return contributors;
}

async function generateAllcontributorsrc(allcontributorsrc, contributors) {
  console.log(util.inspect(contributors));
  for (const contributor of contributors) {
    allcontributorsrc.contributors.push({
      login: contributor.login,
      name: contributor.name,
      profile: contributor.profileURL,
      avatar_url: contributor.avatarURL,
    });
  }

  return allcontributorsrc;
}

async function generateContributorExclusions(maintainersFilePath) {
  const loginRegexp = /@[A-Za-z0-9]+/g;
  let contributorExclusions = ['rennovate-bot'];

  let fileData = await new Promise((resolve, reject) => {
    fs.readFile(maintainersFilePath, undefined, (err, data) => {
      if (err) reject(err);
      resolve(data.toString());
    });
  });

  return [...contributorExclusions, ...([...fileData.matchAll(loginRegexp)].map(val => val[0].slice(1)))];
}

async function updateAllcontributorsrc(acrFilePath, allcontributorsrc, contributors) {
  allcontributorsrc = await generateAllcontributorsrc(allcontributorsrc, contributors);
  fs.writeFile(acrFilePath, allcontributorsrc, err => {
    if (err) return err;
  });
}

generateContributorExclusions(MAINTAINERS_FILEPATH)
  .then(contributorExclusions => {
    getContributors(contributorExclusions)
      .then(contributors => {
        updateAllcontributorsrc(ALLCONTRIBUTORSRC_FILEPATH, ALLCONTRIBUTORSRC_BASE, contributors);
      });
  })
  .catch(err => {
    console.error('An error occured: \n' + err);
  });
