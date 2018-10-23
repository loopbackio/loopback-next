#!/usr/bin/env node

const Docs = require('..').Docs;
const argv = require('optimist').argv;
const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('loopback:tsdocs:cli');
const port = argv.port || process.env.PORT || 3000;
const express = require('express');
const configPaths = {};
const configPath = argv.config || argv.c || 'docs.json';
let outputPath = argv.out || argv.o;

// --html-file
// The file name for generated html
const htmlFile = argv['html-file'] || 'index.html';
const tsConfig = argv.tsconfig;
const tsTarget = argv.tstarget;
const previewMode = argv.preview || argv.p;
const packagePath = argv.package || 'package.json';
// --skip-public-assets
// Do not copy `public` assets as it can be shared
const skipPublicAssets = argv['skip-public-assets'] || false;
const showHelp =
  argv.help || argv.h || !(outputPath || previewMode) || outputPath === true;

/*
 * Display help text
 */

if (showHelp) {
  console.log(fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8'));
  process.exit();
}

/*
 * Config
 */
debug('Config arg: %s', configPath);
configPaths.configPath = path.resolve(process.cwd(), configPath);

/**
 * Package metadata
 */
debug('Package arg: %s', packagePath);
configPaths.packagePath = path.resolve(process.cwd(), packagePath);

/**
 * Output path
 */
debug('Out arg: %s', outputPath);
configPaths.outputPath = path.resolve(process.cwd(), outputPath);
outputPath = configPaths.outputPath;

debug('Config/package/output paths: %j', configPaths);
/*
 * Assets
 */

function getAssetData(config) {
  let assets = config.assets;

  if (!assets) {
    return null;
  }

  if (typeof assets === 'string') {
    assets = {
      '/assets': assets,
    };
  }

  let assetsRoot;
  if (config.root) {
    assetsRoot = path.resolve(process.cwd(), config.root);
  } else {
    assetsRoot = path.dirname(configPaths.configPath);
  }
  debug('Root directory for assets: %s', assetsRoot);
  Object.keys(assets).forEach(function(key) {
    assets[key] = path.resolve(assetsRoot, assets[key]);
  });

  debug('Assets: %j', assets);
  return assets;
}

/*
 * Preview mode
 */

if (previewMode) {
  const app = express();

  // build the preview app on every request
  app.use(function(req, res, next) {
    const sapp = express();

    Docs.readConfig(configPaths, function(err, config) {
      if (err) return next(err);
      debug('Config object: %j', config);
      config = configureTypeDoc(config);
      const assets = getAssetData(config);

      if (assets) {
        Object.keys(assets).forEach(function(key) {
          sapp.use(key, express.static(assets[key]));
        });
      }

      sapp.get('/', function(req, res) {
        Docs.toHtml(config, function(err, html) {
          if (err) {
            next(err);
          } else {
            res.send(html);
          }
        });
      });

      sapp.handle(req, res, next);
    });
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.listen(port, function() {
    if (process.stdout.isTTY) {
      console.log('Preview your docs @ http://localhost:' + port);
      console.log();
      console.log('Refresh your browser to rebuild.');
    } else {
      console.log('http://localhost:' + port);
    }
  });
}

/*
 * Output mode
 */

if (outputPath) {
  if (!skipPublicAssets) {
    const publicAssets = path.join(__dirname, '..', 'public');
    debug('Copying public assets from "%s" to "%s"', publicAssets, outputPath);
    fs.copySync(publicAssets, outputPath);
  } else {
    // When the public assets is skipped, make sure the output dir
    // exists or be created
    fs.ensureDirSync(outputPath);
  }

  Docs.readConfig(configPaths, function(err, config) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    config = configureTypeDoc(config);
    debug('Config object with typedoc: %j', config);
    const assets = getAssetData(config);

    if (assets) {
      Object.keys(assets).forEach(function(key) {
        const source = assets[key];
        if (!fs.existsSync(source)) {
          console.warn(
            'Ignoring unknown assets directory: %s -> %s',
            key,
            source,
          );
          return;
        }
        const target = path.join(outputPath, key);
        if (target.indexOf(source) !== 0) {
          debug('Copying asset from "%s" to "%s"', source, target);
          if (fs.statSync(source).isFile()) {
            fs.copySync(source, target);
          } else {
            fs.ensureDirSync(target);
            fs.copySync(source, target);
          }
        } else {
          console.warn(
            'Skipping asset "%s". Target "%s" is the same or a subdirectory of "%s"',
            key,
            target,
            source,
          );
        }
      });
    }

    Docs.toHtml(config, function(err, html) {
      if (err) {
        console.error(err);
        process.exit(1);
      } else {
        debug('Writing html file "%s" to "%s"', htmlFile, outputPath);
        fs.writeFileSync(path.join(outputPath, htmlFile), html);
      }
    });
  });
}

/**
 * Configure options for TypeDoc
 * @param {*} config
 */
function configureTypeDoc(config) {
  config = config || {};
  config.typedoc = config.typedoc || {};
  const typeDocOptions = config.typedoc;
  if (tsConfig) {
    typeDocOptions.tsconfig = tsConfig;
  }
  if (tsTarget) {
    typeDocOptions.target = tsTarget;
  }
  return config;
}
