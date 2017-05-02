#! groovy

def withNode(ver) {
  return {
    node('nvm') {
      checkout scm
      sh("""#!/bin/bash
        export NVM_DIR=/home/jenkins/.nvm
        . ~/.nvm/nvm.sh
        nvm install ${ver}
        npm install
        npm run bootstrap
        npm test
      """)
    }
  }
}

def builds = [
  node4: withNode(4),
  node6: withNode(6),
  node7: withNode(7),
  failFast: false,
]

parallel builds
