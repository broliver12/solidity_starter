/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/* Subject to MIT License                                                   */
/****************************************************************************/

const fs = require('fs')
const { log, logs } = require('./util_cli.js')

// Create a file at the specified path, if it does not already exist.
async function writeToFile(path, data) {
    createFileIfNotExists(path, data)
}

async function createFileIfNotExists(path, data) {
    try {
        fs.writeFileSync(
            path,
            data,
            { flag: 'wx' },
            function (err) {},
        )
    } catch (err) {
        if (err.code == 'EEXIST') {
            // Do nothing
        } else if (err != null) {
            log(
                '!!!!!!Error creating file. This should not happen. Ensure you backup your deployed contract addresses.!!!!!!',
            )
        }
    }
}

async function tryRead(path) {
    try {
        const contractFileData = fs.readFileSync(path)
        return (contractFileJson = JSON.parse(contractFileData))
    } catch (e) {}
}

// Save contract data to specified file path
// Create backup if data in file cannot be appended to corectly.
// New backup files should be "*.json" and contain only an empty json array []
async function saveNewContract(path, contractName, contractAddress) {
    createFileIfNotExists(path, JSON.stringify([]))
    let newContractJson = { [contractName]: contractAddress }
    let contractFileData = ''
    let contractFileJson
    // Get existing array of addresses from deployedContracts file
    try {
        contractFileData = fs.readFileSync(path)
        contractFileJson = JSON.parse(contractFileData)
    } catch (e) {}

    // Add new contract to the array
    try {
        contractFileJson.push(newContractJson)
    } catch (e) {
        // Failed to push for whatever reason
        // Back up existing broken deployedContracts in a new backup fi
        // Overwrite deployedContracts.json
        let backupPath = path.replace('.json', '_backup_0.json')
        let i = 0
        const ext = '.json'
        let exists = fs.existsSync(backupPath)

        // Create a new backup file with an unused name
        if (!exists) {
            createFileIfNotExists(backupPath)
            fs.writeFileSync(backupPath, contractFileData)
        }
        while (exists == true) {
            backupPath = backupPath.replace(
                `${i}.json`,
                `${i + 1}.json`,
            )
            i = i + 1
            try {
                if (!fs.existsSync(backupPath)) {
                    createFileIfNotExists(backupPath)
                    fs.writeFileSync(backupPath, contractFileData)
                    exists = false
                }
            } catch (err) {
                exists = false
                console.error(err)
                logs([
                    'BACKUP FAILED: The system failed to backup your address file.',
                    '!!!!!You need to maunally save your contract addresses elsewhere.!!!!!',
                    `BACKUP DATA: ${contractFileData}`,
                ])
            }
        }

        logs([
            '\n',
            `Unable to properly parse provide deployed addresses json.\nBacking up at ${backupPath} and overwriting ${path}`,
        ])

        contractFileJson = []
        contractFileJson.push(newContractJson)
    }

    try {
        // Overwrite deployedContracts file
        fs.writeFileSync(path, JSON.stringify(contractFileJson))
        logs([
            '\n',
            `Successfully saved: ${JSON.stringify(
                newContractJson,
            )} to ${path}\n`,
        ])
    } catch (e) {
        logs([
            '\n',
            '\n',
            'ERROR: Problem writing json to file.',
            `Reason: ${e}`,
            '!!!!!! MANUALLY SAVE THE DEPLOYED CONTRACT ADDRESS OR IT WILL BE LOST !!!!!!',
            `CONTRACT ADDRESS (SAVE THIS VALUE MANUALLY): ${JSON.stringify(
                newContractJson,
            )}\n`,
        ])
    }
}

exports.writeToFile = writeToFile
exports.tryRead = tryRead
exports.saveNewContract = saveNewContract
