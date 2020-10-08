const semver = require('semver');

const canUseBuiltinSourceMaps = semver.gte(process.version, 'v12.11.0');
module.exports = {
  require: !canUseBuiltinSourceMaps ? ['source-map-support/register'] : [],
  recursive: true,
  exit: true,
  reporter: 'dot',
  'enable-source-maps': canUseBuiltinSourceMaps,
};
