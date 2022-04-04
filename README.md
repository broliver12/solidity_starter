<img src="./resources/solidity_starter_readme_banner.png"/>

> _A Node.js, Solidity and DevOps project that streamlines the first steps of becoming a Web3 developer._
***
## Motivation
New Solidity developers often find themselves in an excitement-driven rush to release their first project, whether it's a simple Smart Contract, Token, NFT, Game, or DAO.

In this rush, coding fundamentals are de-prioritized, and in the case of Solidity, *a particularly strict and specific language*, essential security rules, syntax standards and general best practices are often **never learned at all**, leaving many existing projects open to exploits. In addition, [Remix IDE](https://remix.ethereum.org/) is the fastest and easiest way to create and deploy Solidity contracts; this results in a sandbox-type environment being used for all stages of project development, which creates a number of project management and security concerns.

**The goal of this project is to help solidity developers write safe, legible and testable code, by simplifying environment setup, removing overhead, and providing examples of properly written and tested Smart Contracts.**
***
## Description
*This repository contains the following components:*

**Development Environment:** Fully configured `Hardhat` development environment.

**Deploy Script:** `npm` script that lets you easily deploy any compiled contract to most blockchains.

**DevOps Scripts:** `npm` scripts to simplify the process of using `hardhat`, `git`, and linters.

**Smart Contracts:**
Library of ready-to-deploy contracts, and extensible features that implement common functionality. Many of these contracts build off of base implementations from `@openzeppelin/contracts`.
 - Included contract varieties: **ERC721, ERC20**

**Complete test suites for all Smart Contracts:** Javascript tests that verify the functionality of our smart contracts using `Waffle` and `Chai`.

***

## Getting started

1. Clone repository
       git clone https://github.com/broliver12/solidity_starter.git

   **OR** ( if you want to ) create a new repository using the `Use this template` button.


2. Run setup command
        npm run setup

  This will install all required dependencies, and change the name of directory `/env_TEMPLATE` to `/env`. This will cause git to ignore the directory, which is essential since our private keys will go here.

**PSA: NEVER** push any of your API keys, speedy node keys, or wallet private key to any public OR private repository. In general, do not share them with anyone. Store them locally in a file (in our case `./env/secrets.json`), and reference them by name where they're needed.

3. Add Wallet address, private key, and RPC Node URLs,  to `./env/secrets.json`
    - Follow [these instructions](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) to find your metamask / wallet provider address & private key.
    - Make a free account on [Moralis](https://moralis.io/). Follow [these instructions](https://docs.moralis.io/speedy-nodes/connecting-to-rpc-nodes/connect-to-eth-node) to get RPC Node URLs for most networks using Moralis Speedy Nodes.


4. Add Etherscan Api Keys to `./env/secrets.json`
    - Follow [these instructions](https://info.etherscan.com/etherscan-developer-api-key/) to generate an etherscan (or other scan service) api key.
    - NOTE: This step is only required for any network you wish to `verify` on.

**That's it, you're ready to deploy & verify a provided contract, or to start developing Solidity in your favourite editor!**

Refer to this example `./env/secrets.json` to see the expected format for each type of key:

    {
      "MUMBAI_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/polygon/mumbai",
      "MATIC_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/polygon/mainnet",
      "ROPSTEN_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/eth/ropsten",
      "RINKEBY_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/eth/rinkeby",
      "HOMESTEAD_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/eth/mainnet",
      "BSC_MAIN_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/bsc/mainnet",
      "BSC_TEST_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/bsc/testnet",
      "AVALANCHE_MAIN_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/avalanche/mainnet",
      "AVALANCHE_TEST_NODE_URL": "https://speedy-nodes-nyc.moralis.io/5hfjs73fj392jnr238fn0kdl/avalanche/testnet",

      "METAMASK_WALLET_PRIVATE_KEY": "5hfjs73fj392jnr238fn0kdl5hfjs73fj392jnr238fn0kdl5hfjs73fj392jnr238fn0kdl",
      "METAMASK_WALLET_ADDRESS": "0x7HME93jdus8JWb29mPE3n4EUR8se08Jsa8K9",

      "ETHERSCAN_API_KEY": "7HME93jdus8JWb29mPE3n4EUR8se08Jsa8K9",
      "BSCSCAN_API_KEY": "7HME93jdus8JWb29mPE3n4EUR8se08Jsa8K9",
      "POLYGONSCAN_API_KEY": "7HME93jdus8JWb29mPE3n4EUR8se08Jsa8K9",
      "SNOWTRACE_API_KEY": "7HME93jdus8JWb29mPE3n4EUR8se08Jsa8K9"
    }

***
## Why is this Environment better than Remix IDE for Solidity development?

- **Version Control**
    - When developing smart contracts using Remix online, you are not developing directly in a `git` repository. In addition to losing all of the version control functionality, this also puts you at risk of losing your code forever.
- **Unit Testing**
    - The most important benefit of using a Hardhat environment (vs Remix) is the ability to rigorously test our contracts using Javascript. This is an essential part of developing solid and reliable contracts.
- **Linting and Autoformat**
    - Regularly using a linter and formatter is essential to developing secure and consistent code.
- **Deploy Contracts Quickly in a Controlled Environment**
    - Avoid the time consuming process of, and the potential vulnerabilities associated wit, repeatedly entering your credentials into your browser. Avoid needing to connect to 3rd party site, sign messages un browser.
    - Deploy quickly and confidently to testnets, or mainnets. No need to copy-paste deployed contract addresses, this information is saved for you automatically.
- **Stricter Compiler (Warnings and syntax)**
    - There are small variations in the way Remix and Hardhat compilers work. In general, Hardhats tends to be a bit more strict. This is an advantage when compiling and optimizing contracts.
- **Code in your Favourite Editor**
    - This should not be overlooked, coding in a powerful editor like Atom or VSCode has many benefits.
***
## [Documentation](https://github.com/broliver12/solidity_starter/blob/main/resources/DOCUMENTATION.md)
***
## Tech Stack
#### Code
- [OpenZeppelin/Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) :  Open source smart contracts
- [node.js](http://nodejs.org) : Javascript Runtime
- [Hardhat](https://hardhat.org/getting-started/) : Solidity Compiler and Development Environment
- [ethers.js](https://docs.ethers.io/v5/) : Web3 wrapper + Blockchain interaction API
- [nomiclabs/hardhat-ethers](https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html) : Plugin for integrating **ethers.js**
- [nomiclabs/hardhat-etherscan](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html) : Plugin for integrating Etherscan (and other Scan services)

#### Testing
- [Waffle](https://getwaffle.io/) : Matchers for testing
- [nomiclabs/hardhat-waffle](https://hardhat.org/plugins/nomiclabs-hardhat-waffle.html) : Plugin for intergrating **Waffle**
- [chai](https://ethereum-waffle.readthedocs.io/en/latest/matchers.html) : Matchers for testing

#### DevOps
- [sohlint](https://github.com/tokenhouse/solhint) : Linter for Solidity
- [eslint](https://eslint.org/) : Linter for Javascript
- [prettier](https://github.com/prettier/prettier) : Auto-formatting for Solidity &  Javascript
***
## Additional Resources
- [Coding With Leif](https://github.com/tokenhouse/solhint) : Youtube Videos about Web3 Development
- [HashLips Github](https://github.com/prettier/prettier) : Open source smart contracts & dapps
- [Solidity Linting](https://medium.com/coinmonks/introduction-to-solidity-linting-and-formatting-e838c074791a) : Medium article on solidity linting options and setup
- [Deletable Mapping](https://ethereum.stackexchange.com/questions/15553/how-to-delete-a-mapping/42540) : Stack Overflow **re:** "How to create a deletable mapping"
- [OpenSea Metadata Standard](https://docs.opensea.io/docs/metadata-standards) : "Expected metadata format for opensea traits"
- [OpenSea Meta Transaction](https://docs.opensea.io/docs/polygon-basic-integration) : Starter code for implementing MATIC-less transactions on OpenSea.
- [Solidity Security Best Practices]() : Tool that helps when learning Solidity Security Fundamentals
***
## Contribution
- Contribution and collaboration welcome! We learn faster together.
- If you want to contribute, please clone the repository, create a new branch, and submit a PR when you're done implementing your Contract or Feature.
- Let me know in advance if you want to work on a large feature, so we can collaborate and avoid overlapping work.
- **If you spot any bugs please let me know!**
***
## License
- [**MIT**](https://github.com/broliver12/blockchain/blob/main/LICENSE.txt)

- *Happy Hacking!*
