const { expect } = require('chai')
const fs = require('fs')

// Name of test suite
describe('', () => {
    // Set these to the contract's name, and path relative to [basePath]
    const CONTRACT_NAME = 'RandomUtil'
    const CONTRACT_PATH = 'other'
    let factory, contract, owner, addr1, addr2
    let addrs
    const REVERT_TAG = 'REVERT_EXPECTED: '
    const basePath = './build/artifacts/solidity/'
    const extension = '.json'
    const fullArtifactPath = `${basePath}${CONTRACT_PATH}/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`
    const contractFileData = fs.readFileSync(fullArtifactPath)
    const COMPILED_CONTRACT = JSON.parse(contractFileData)

    // Runs before each test
    beforeEach(async () => {
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
        factory = await ethers.getContractFactory(
            COMPILED_CONTRACT.abi,
            COMPILED_CONTRACT.bytecode,
            owner,
        )
        // Pass in desired constructor arguments here
        contract = await factory.deploy()
        await contract.deployTransaction.wait()
    })

    // A test that should pass
    describe(`${CONTRACT_NAME} - Random Generates`, () => {
        it('', async () => {
            const val1 = await contract.random(1)
            const val2 = await contract.random(2)
            const val3 = await contract.random(3)

            if (val1 == val2 || val2 == val3 || val3 == val1) {
                throw err
            }
        })
    })
})
