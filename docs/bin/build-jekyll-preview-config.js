#!/usr/bin/env node

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const src = process.argv[2];
const dest = process.argv[3] || src;

if (!src) {
  console.log(`
Missing required argument: path to original Jekyll config');

Usage:

  node %s <source _config.yml> [dest path]', process.argv[1]);

`);
  process.exit(1);
}

console.log('Reading Jekyll config from %s', src);
const config = yaml.safeLoad(fs.readFileSync(src, 'utf8'));

config.sidebars = ['lb4_sidebar'];
config.defaults[0].values.sidebar = 'lb4_sidebar';
config.plugins = config.plugins.filter(p => p !== 'jekyll-sitemap');

console.log('Writing Jekyll config to %s', dest);
fs.writeFileSync(dest, yaml.dump(config), 'utf8');
