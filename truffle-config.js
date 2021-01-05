require('dotenv').config()
const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: process.env.DEPLOYMENT_LOCAL_HOST,
      port: process.env.DEPLOYMENT_LOCAL_PORT,
      network_id: process.env.DEPLOYMENT_LOCAL_NETWORK_ID,
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.11",    // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
      }
    }
  }
};
