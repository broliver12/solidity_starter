const { expect } = require('chai')
const fs = require('fs')

// Name of test suite
describe('', () => {
    // Set these to the contract's name, and path relative to [basePath]
    const CONTRACT_NAME = 'OpenSeaMaticERC721'
    const CONTRACT_PATH = 'ERC721/base'
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
        contract = await factory.deploy('TestName', 'TEST')
        await contract.deployTransaction.wait()
    })

    // A test that should pass
    describe(`${CONTRACT_NAME} - OpenSea is approved for all`, () => {
        it('', async () => {
            const a = '0x58807baD0B376efc12F5AD86aAc70E78ed67deaE'
            expect(
                await contract.isApprovedForAll(
                    owner.getAddress(),
                    a,
                ),
            ).to.equal(true)
        })
    })
})
