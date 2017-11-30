const nodeMajorVersion = +process.versions.node.split('.')[0];
const dist = nodeMajorVersion >= 7 ? './dist' : './dist6';

const application = (module.exports = require(dist));

if (require.main === module) {
  // Run the application
  application.main();
}
