//tests

OwnableERC20
ERC721 _receiver
ERC721 evolve stakeable whitelist unlimited unique

<img src="./solidity_starter_documentation_banner.png"/>

# Contents:

1. CLI Scripts - Description & Usage
    - Setup
    - Build
    - Test
    - Deploy
    - Verify
    - Lint & Format
    - Pipeline
    - Git



2. Provided Smart Contracts
    - Optimized + ready-to-deploy contracts
    - Extensible contracts
    - Util
***

# CLI Scripts
>Note: to use these commands, you must have `npm` and `git` command line tools configured; You can check if you have them configured by running:

    > git version
    > npm version
>If either of these commands doesn't work, please follow the instructions linked below:
>- Git command line setup instructions
- Npm command line setup instructions

***
## Setup

    npm run setup
- Downloads all dependencies, renamed `env_TEMPLATE` dir to `env`.
- Run this **ONCE** when you initially clone the project.
- Follow setup instructions in main project README.
***

## Build

    npm run build
- Compile all smart contracts in the `./solidity/` directory
- **Alias for** `npx hardhat compile`
***

    npm run clean
- **Destructive operation:** Deletes all files in the `/build` directory.
- Recreates `/build/artifacts` and `/build/cache` with the required `.gitignore` files
- **CAUTION:** DO NOT run this between deploying and verifying! The exact bytecode that you used to deploy will be deleted, and to retrieve it, you will need to recompile the unaltered contract in an unaltered environment!
***

    npm run rebuild
- Runs `clean` then `compile`.
- You should run this after you change the sub-directory structure of the `/solidity`
directory.
***

## Test
    npm run test
- Run all tests in the `./test/` directory. These are Javascript files that contain tests for provided smart contracts.
- **Alias for** `npx hardhat test`
***

## Deploy
    npm run deploy
- Deploys the specified contract to the specified blockchain.
- Takes user input to decide which blockchain, and compiled contract to use.
- Checks constraints, deploys contract to blockchain, and records the deployed address.

- **BEFORE Running This Command**:
    - Set up your MetaMask wallet address and private key.
    - Set your RPC Node URL for the desired network.


    Example Usage of `npm run deploy`
    // To be Finalized


- **Alias for** `npx hardhat run ./scripts/deploy.js`
***

## Verify
    > npm run verify networkName deployedContractAddress

    EG:

    > npm run verify mumbai 0xU358734CNV59435VNB54ICUCM45C854NC35

- **BEFORE Running This Command**: Change the `etherscan.apiKey` export to the appropriate value. EG, for the mumbai network;
- Verifies and publishes source code for the specified contract using the network-specific Scan Service.


```
module.exports = {
      ...
      etherscan: {
            apiKey: scanKeys.mumbai
      },
      ...
}
```
- This values is set in `./hardhat.config.js`, and currrently must be exported as a single string value.
- As per the setup instructions, your scan service API keys should be defined in `./env/secrets.json`.

- **Alias for** `npx hardhat verify --network`
- **If you have multiple contracts with the same bytecode** you need to specify the contract name. Use:


      npx hardhat run verify --contract contractName --network networkName deployedContractAddress

      EG

      npx hardhat run verify --contract MyNFT --network mumbai 0xU358734CNV59435VNB54ICUCM45C854NC35
***

## Lint & Format

**CAUTION:** Formatting has the capability to overwrite your files. Prettier's official documentation recommends committing essential changes to git before running format commands.

    npm run lint:solidity
- Run solhint linter on all contracts in the `./solidity/` directory
***
    npm run format:solidity
- Run prettier auto-format on all contracts in the `./solidity/` directory
***
    npm run lint:tests
- Run eslint linter on all tests in the `./test/` directory
***
    npm run format:tests
- Run prettier auto-format on all tests in the `./test/` directory
***
    npm run lint:scripts
- Run eslint linter on all files in the `./scripts/` directory
***
    npm run format:scripts
- Run prettier auto-format on all tests in the `./test/` directory
***

## Pipeline
    npm run pipeline:lint
- Run a read-only pipeline on all contracts in the `./solidity/` directory.
- Pipeline steps: `lint -> compile -> test`

***
    npm run pipeline:format
- Run a complete pipeline on all contracts in the `./solidity/` directory.
- Pipeline steps: `compile -> format -> lint -> compile -> test`
- **CAUTION:** This has the capability to overwrite your files. Prettier's official documentation recommends committing essential changes to git before running this command.
***

## Git

    npm run commit "message"

    EG

    npm run commit "This will commit all local changes with this msg."

- Commit helper that adds all local changes, prints them, them commits them with the provided message
- **Alias for** `git add . && git status && git commit -m`
***
    npm run push

- Push helper that ensures that all Solidity compiles and passes the linter before being pushed to remote.
- **Alias for** `npm run compile && npm run lint && git push`

***
***
# Provided Smart contracts

## Recommended Usage

If an optimized contract already exists that matches your desired functionality, you can deploy it directly.

Otherwise, you should first extend and combine contract to create the functionality you want.
Add any custom logic, flatten your working (and tested) contract, save to a new file, and optimize!
