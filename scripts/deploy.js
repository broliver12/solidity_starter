/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/* Subject to MIT License                                                   */
/****************************************************************************/

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
/* WARNING!!! Live deploy file. You can lose real money running this code.  */
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
const fs = require('fs')
const secret = require('./../env/secrets.json')
const config = require('./../hardhat.config.js')
const networks = JSON.parse(config.networkInfo)
const { saveNewContract } = require('./util_fs.js')
const { log, logs, prompt } = require('./util_cli.js')
/***************************************************************************
    Paths of deployed contract address file, and backup directory.
    Don't change these unlesss you know what you're doing and are rewriting.
****************************************************************************/
const deployedContractAddressFilePath = './env/deployedContracts.json'
const backupDirPath = './build/cache/'
/***************************************************************************
    Add the name of any network you consider a mainnet.
    You will be asked to re-confirm before deploying to these networks
****************************************************************************/
const exitStr = '^exit'
const exit = () => {
    logs(['\n', `Aborting Deploy, Exiting Program.`], 'red')
    process.exit(1)
}
/***************************************************************************/

async function deploy() {
    /***************************************************************************/
    let validNetwork = false
    let validContract = false
    let NETWORK_NAME = ''
    let networkInfo

    while (!validNetwork) {
        // Get user input for network name
        NETWORK_NAME = prompt(
            'Please enter the name of the network you want to deploy on : ',
        )
        // Check network name is valid before fetching provider
        if (NETWORK_NAME == exitStr) {
            exit()
        } else if (!networks.hasOwnProperty(`${NETWORK_NAME}`)) {
            logs(
                [
                    `\n`,
                    `Invalid network name.`,
                    `To add more networks, update the "nw" object in "./hardhat.config.js"`,
                    `Please choose one of the following networks:`,
                    `\n`,
                ],
                'red',
            )

            for (i in networks) {
                logs([i], 'yellow')
            }

            logs(
                [`\n`, `OR enter ${exitStr} to exit program.`, `\n`],
                'red',
            )
        } else {
            validNetwork = true
        }
    }

    // Network info contains sensitive info (private keys) that should not be logged
    // Specifically try not to log `networkInfo.acc`
    networkInfo = networks[NETWORK_NAME]
    let networkType
    if (networkInfo.mainnet) {
        networkType = 'Mainnet'
    } else {
        networkType = 'Testnet'
    }
    /***************************************************************************/

    /***************************************************************************/
    // Connect to specified blockchain, and Metamask

    // Use ethers.js to create a provider, using the associated rpc node url.
    // provider is an abstraction of the connection. It can be used to view
    // the blockchain, but not alter it, or sign messages
    const provider = new ethers.providers.JsonRpcProvider(
        networkInfo.url,
    )

    if (provider === undefined || provider == null) {
        logs(
            [
                '\n',
                `Unable to connect to ${NETWORK_NAME} ${networkType}.`,
            ],
            'red',
        )
        return
    }
    // Log network info after connection.
    const network = await provider.getNetwork()
    // Manually double check that we are connected to the right network
    if (network.chainId != networkInfo.chainId) {
        logs(
            [
                '\n',
                `Chain IDs don't match! This is likely a problem with your confirguration.`,
                `Make sure the chain ID for the desired network is set correctly in ./hardhat.config.js`,
                `Not safe to proceed without being certain of network ID.`,
            ],
            'red',
        )
        return
    }

    logs(
        [
            '\n',
            'Network information:',
            JSON.stringify(network, null, 4),
        ],
        'green',
    )

    // Create a new ethers wallet
    // Create a signer by connecting our wallet (account) to provider (blockchain access)
    // We can use this signer to sign messages, or alter the blockchain.
    let wallet
    let signer
    try {
        wallet = new ethers.Wallet(networkInfo.accounts[0])
        signer = wallet.connect(provider)
        logs(
            [
                '\n',
                `Successfully connected to ${NETWORK_NAME}.`,
                `Using address: ${wallet.address}`,
            ],
            'green',
        )
    } catch (exception) {
        logs(
            [
                '\n',
                'Problem creating wallet or signer. Make sure you set METAMASK_WALLET_PRIVATE_KEY in ./env/secrets.json',
                exception,
            ],
            'red',
        )
        return
    }
    /***************************************************************************/

    /***************************************************************************/
    // Get user input for contract name
    let factory
    let CONTRACT_NAME = ''
    while (!validContract) {
        CONTRACT_NAME = prompt(
            'Please enter the name of the contract you wish to deploy : ',
        )

        if (CONTRACT_NAME == exitStr) {
            exit()
        }

        try {
            factory = await ethers.getContractFactory(
                CONTRACT_NAME,
                signer,
            )
            validContract = true
            logs(
                ['\n', 'Successfully fetched compiled contract.'],
                'green',
            )
        } catch (exception) {
            logs(
                [
                    '\n',
                    'Invalid contract name. Choose a valid compiled contract name.',
                    'Compiled contracts can be found in the subdirectories of ./build/artifacts/solidity/',
                    `\n`,
                    `OR enter ${exitStr} to exit program.`,
                    `\n`,
                ],
                'red',
            )
        }
    }
    /***************************************************************************/

    /***************************************************************************/
    // Get user input for identifier string.
    // ENTER key will generate a default string.
    logs([
        '\n',
        'Please enter a string to uniquely identify this contract after deployment.',
        '\n',
        'Ideally, use a UNIQUE string formatted like: `contractNameNetworkName123`',
    ])

    let CONTRACT_JSON_KEY = prompt(
        'Enter contract identifier, or press ENTER to use a default ID : ',
    )
    if (CONTRACT_JSON_KEY == '') {
        CONTRACT_JSON_KEY =
            CONTRACT_NAME.charAt(0).toLowerCase() +
            CONTRACT_NAME.slice(1) +
            '_DeployedOn_' +
            NETWORK_NAME.charAt(0).toUpperCase() +
            NETWORK_NAME.slice(1)
        logs(
            [
                '\n',
                `Empty contract key entered, Saving contract address under : ${CONTRACT_JSON_KEY} ...`,
            ],
            'yellow',
        )
    } else if (CONTRACT_JSON_KEY == exitStr) {
        exit()
    } else {
        logs(
            [
                '\n',
                `Saving contract address under : ${CONTRACT_JSON_KEY} ...`,
            ],
            'yellow',
        )
    }
    /***************************************************************************/

    /***************************************************************************/
    // Ask for confirmation and estimate gas before deploying to mainnets
    logs(
        [
            '\n',
            `ATTENTION: You're deploying to the ${NETWORK_NAME} ${networkType}.`,
        ],
        'yellow',
    )

    let confirmation = ''
    let confirmNetwork = false
    while (!confirmNetwork) {
        confirmation = prompt(
            `Are you 100% sure you wish to proceed (y/n) : `,
        )
        if (
            confirmation.toLowerCase() == 'y' ||
            confirmation.toLowerCase() == 'yes'
        ) {
            logs([`Proceeding...`, `\n`])
            confirmNetwork = true
        } else if (
            confirmation.toLowerCase() == 'n' ||
            confirmation.toLowerCase() == 'no' ||
            confirmation == exitStr
        ) {
            exit()
        } else {
            logs([
                `\n`,
                'Please enter y/yes to Proceed, or n/no/${exitStr} to Abort.',
                `\n`,
            ])
        }
    }

    const gasUnits = await ethers.provider.estimateGas(
        factory.getDeployTransaction(),
    )
    const gasPrice = await signer.getGasPrice()
    const gasCost = gasUnits.mul(gasPrice)

    const gasUnitsStr = ethers.utils.formatUnits(gasUnits, 0)
    const gasPriceStr = ethers.utils.formatUnits(gasPrice, 9)
    const gasCostStr = ethers.utils.formatUnits(gasCost, 18)
    const gweiMult = 1000000000
    const gr = 1000000

    logs(
        [
            '\n',
            'Gas Information:',
            '\n',
            `UNITS TO DEPLOY: ${gasUnitsStr}`,
            `CURRENT PRICE / UNIT (gwei): ${gasPriceStr}`,
            `Estimated cost (${networkInfo.currency}): ${
                Math.round(gasCostStr * gr) / gr
            }`,
            '\n',
            `Cost at 20 gwei: ${
                Math.round(gr * ((gasUnits * 20) / gweiMult)) / gr
            } ${networkInfo.currency}`,
            `Cost at 40 gwei: ${
                Math.round(gr * ((gasUnits * 40) / gweiMult)) / gr
            } ${networkInfo.currency}`,
            `Cost at 60 gwei: ${
                Math.round(gr * ((gasUnits * 60) / gweiMult)) / gr
            } ${networkInfo.currency}`,
            `Cost at 80 gwei: ${
                Math.round(gr * ((gasUnits * 80) / gweiMult)) / gr
            } ${networkInfo.currency}`,
            `Cost at 100 gwei: ${
                Math.round(gr * ((gasUnits * 100) / gweiMult)) / gr
            } ${networkInfo.currency}`,
            '\n',
        ],
        'yellow',
    )

    let gasPriceSelected = false

    while (!gasPriceSelected) {
        gasSelectedPrice = prompt(
            `Please enter your desired gas price (in gwei), or [enter] to leave blank: `,
        )
        if (gasSelectedPrice == '') {
            gasSelectedPrice = null
            gasPriceSelected = true
        }
        if (gasSelectedPrice < 0 || gasSelectedPrice > 100) {
            logs(
                [`Illegal gas value (0 - 100 gwei accepted).`],
                'red',
            )
        } else if (gasSelectedPrice == '^exit') {
            exit()
        } else {
            gasPriceSelected = true
        }
    }

    let confirmGas = false
    let gasConfirm = ''
    while (!confirmGas) {
        if (gasSelectedPrice == null) {
            logs(
                [
                    `ATTENTION: Deploying will cost about ${
                        Math.round(gasCostStr * gr) / gr
                    } ${networkInfo.currency}.`,
                    `ATTENTION: Not setting a fixed gas price can lead to you losing money!!!`,
                ],
                'yellow',
            )
        } else {
            logs(
                [
                    `ATTENTION: Deploying will cost ${
                        gasSelectedPrice * (gasUnits / gweiMult)
                    } ${networkInfo.currency}.`,
                ],
                'yellow',
            )
        }
        gasConfirm = prompt(
            `Are you 100% sure you wish to proceed (y/n) : `,
        )
        if (
            gasConfirm.toLowerCase() == 'y' ||
            gasConfirm.toLowerCase() == 'yes'
        ) {
            logs(
                ['Deploy Confirmed.', `Deploying...`, `\n`],
                'yellow',
            )
            confirmGas = true
        } else if (
            gasConfirm.toLowerCase() == 'n' ||
            gasConfirm.toLowerCase() == 'no' ||
            gasConfirm == exitStr
        ) {
            exit()
        } else {
            logs([
                `\n`,
                `Please enter y/yes to Proceed, or n/no/${exitStr} to Abort.`,
                `\n`,
            ])
        }
    }
    /***************************************************************************/

    /***************************************************************************/
    let contract = {
        address: 'didNotDeploy',
    }
    try {
        // Deploy contract
        gasSelectedPrice *= gweiMult
        const gasSelectedBigNum =
            ethers.BigNumber.from(gasSelectedPrice)
        contract = await factory.deploy({
            gasLimit: gasUnits,
            gasPrice: gasSelectedBigNum,
        })

        const transactionInfo = {
            network: networkInfo.chainId,
            gasPrice: gasSelectedBigNum,
            gasLimit: contract.deployTransaction.gasLimit,
            deployment_address: contract.address,
            transaction_hash: contract.deployTransaction.hash,
        }

        logs(
            [
                '\n',
                `Transaction information:`,
                '\n',
                JSON.stringify(transactionInfo, null, 4),
            ],
            'yellow',
        )
        await contract.deployTransaction.wait()
    } catch (e) {
        logs(['\n', `ERROR DEPLOYING CONTRACT`, e], 'red')
        exit()
    }

    // Log and store output
    logs(
        [
            '\n',
            `Contract " ${CONTRACT_NAME} " was deployed on ${NETWORK_NAME} at address: ${contract.address}`,
        ],
        'green',
    )
    // Safely save the deployed contract information
    saveNewContract(
        deployedContractAddressFilePath,
        CONTRACT_JSON_KEY,
        contract.address,
    )
    /***************************************************************************/
}
/***************************************************************************
 Handle exit and errors gracefully, don't edit this!
****************************************************************************/
async function main() {
    deploy()
        .then(() => {
            process.exit(0)
        })
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}
main()
/****************************************************************************/
