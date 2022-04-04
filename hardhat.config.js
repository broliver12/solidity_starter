require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const secret = require("./env/secrets.json");

// Formatted private key
const acc = [`0x${secret.METAMASK_WALLET_PRIVATE_KEY}`];

// Available Solidity compiler versions
const pragmas = [
  {
    version : "0.8.11"
  },
  {
    version : "0.8.4"
  },
];

const currencies = {
  ether: "ETH",
  polygon: "MATIC",
  binance: "BNB"
}

// Available Networks
const nw = {
  hardhat: {},
  homestead: {
    url: secret.HOMESTEAD_NODE_URL,
    chainId: 1,
    accounts: acc,
    currency: currencies.ether,
    mainnet: true
  },
  matic: {
    url: secret.MATIC_NODE_URL,
    chainId: 137,
    accounts: acc,
    currency: currencies.polygon,
    mainnet: true
  },
  ropsten: {
    url: secret.ROPSTEN_NODE_URL,
    chainId: 3,
    accounts: acc,
    currency: currencies.ether,
    mainnet: false
  },
  rinkeby: {
    url: secret.RINKEBY_NODE_URL,
    chainId: 4,
    accounts: acc,
    currency: currencies.ether,
    mainnet: false
  },
  mumbai: {
    url: secret.MUMBAI_NODE_URL,
    chainId: 80001,
    gasPrice: 8000000000,
    accounts: acc,
    currency: currencies.polygon,
    mainnet: false
  },
  binance: {
    url: secret.BSC_MAIN_NODE_URL,
    chainId: 56,
    gasPrice: 20000000000,
    accounts: acc,
    currency: currencies.binance,
    mainnet: true
  },
  binanceTestNet: {
    url: secret.BSC_TEST_NODE_URL,
    chainId: 97,
    gasPrice: 20000000000,
    accounts: acc,
    currency: currencies.binance,
    mainnet: false
  },
  avalanche: {
    url: secret.AVALANCHE_MAIN_NODE_URL,
    chainId: 43114,
    accounts: acc,
    currency: currencies.ether,
    mainnet: true
  },
  avalancheTestNet: {
    url: secret.AVALANCHE_TEST_NODE_URL,
    chainId: 43113,
    accounts: acc,
    currency: currencies.ether,
    mainnet: false
  },
};

// Use this to keep track of which networks use which scan key
const scanKeys = {
  homestead: secret.ETHERSCAN_API_KEY,
  ropsten: secret.ETHERSCAN_API_KEY,
  rinkeby: secret.ETHERSCAN_API_KEY,
  matic: secret.POLYGONSCAN_API_KEY,
  mumbai: secret.POLYGONSCAN_API_KEY,
  binance: secret.BSCSCAN_API_KEY,
  binanceTestNet: secret.BSCSCAN_API_KEY,
  avalanche: secret.SNOWTRACE_API_KEY,
  avalancheTestNet: secret.SNOWTRACE_API_KEY
};

// Hardhat config exports
module.exports = {
  solidity: {
    compilers : pragmas,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./solidity",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
  },
  defaultNetwork: "hardhat",
  networks: nw,
  networkInfo: JSON.stringify(nw),
  etherscan: {
    // This NEEDS to be a single string for now.
    // Change this to the correct network's scanKey
    // before running verify or other hardhat scan operations
    apiKey: scanKeys.homestead
  },
  mocha: {
    timeout: 300000
  }
};
