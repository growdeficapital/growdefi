const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
/*     development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }, */
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraKey}`),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 1,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    live: {
      provider: () => new HDWalletProvider(mnemonicMain, `https://mainnet.infura.io/v3/${infuraKeyMain}`),
      network_id: 1,
      gasPrice: web3.utils.toWei('100', 'gwei'),
      timeoutBlocks: 500,
    }
  },
  compilers: {
    solc: {
      version: "0.6.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1500
        }
      }
    }
  }
};
