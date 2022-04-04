const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set this to the contract's path relative to [basePath]
    // Eg: ERC721/base/OwnableERC721.sol/OwnableERC721
    const CONTRACT_NAME = 'OwnableERC20'
    const CONTRACT_PATH = 'ERC20'
    let factory, contract, owner, addr1, addr2
    let addrs
    const REVERT_TAG = 'REVERT_EXPECTED: '
    const basePath = './build/artifacts/solidity/'
    const extension = '.json'
    const fullArtifactPath = `${basePath}${CONTRACT_PATH}/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`
    const contractFileData = fs.readFileSync(fullArtifactPath)
    const COMPILED_CONTRACT = JSON.parse(contractFileData)
    const amt = ethers.utils.parseEther('1')

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

    describe(CONTRACT_NAME + ' - Deployment', () => {
        it('Should have total assets of 0', async () => {
            expect(await contract.totalSupply()).to.equal(0)
        })
        it('Owner can mint', async () => {
            await contract
                .connect(owner)
                .mint(owner.getAddress(), amt)
            expect(
                await contract.balanceOf(owner.getAddress()),
            ).to.equal(amt)
        })
        it('Owner can burn', async () => {
            await contract
                .connect(owner)
                .mint(owner.getAddress(), amt)
            await contract
                .connect(owner)
                .burn(owner.getAddress(), amt)
            expect(
                await contract.balanceOf(owner.getAddress()),
            ).to.equal(0)
        })
    })
})
