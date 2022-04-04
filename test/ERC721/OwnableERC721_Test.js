const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set this to the contract's path relative to [basePath]
    // Eg: For ./build/artifacts/ERC721/base/OwnableERC721.sol/OwnableERC721
    // -> ERC721/base
    const CONTRACT_NAME = 'OwnableERC721'
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
        contract = await factory.deploy('TestName', 'Symbol')
        await contract.deployTransaction.wait()
    })

    describe(CONTRACT_NAME + ' - Withdraw', () => {
        it('Owner can withdraw 0', async () => {
            expect(await contract.connect(owner).withdraw())
        })

        it(`${REVERT_TAG}: ${CONTRACT_NAME} - Non-owner can't withdraw`, async () => {
            expect(
                await contract.connect(addr1).withdraw(),
            ).to.be.revertedWith('Not the owner')
        })
    })
})
