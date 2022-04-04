const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set this to the contract's path relative to [basePath]
    // Eg: ERC721/base/OwnableERC721.sol/OwnableERC721
    const CONTRACT_NAME = 'CoreERC721'
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
        contract = await factory.deploy('TestName', 'TEST', 100)
        await contract.deployTransaction.wait()
    })

    describe(CONTRACT_NAME + ' - Deployment', () => {
        it('Should have 100 supply', async () => {
            expect(await contract.checkRemainingSupply()).to.equal(
                100,
            )
        })
        it(REVERT_TAG + 'Mint should be disabled', async () => {
            expect(
                await contract
                    .connect(owner)
                    .mint(addr1.getAddress(), 1, {
                        value: 0,
                    }),
            ).to.be.revertedWith('Minting not enabled.')
        })
        it('Free mint functional', async () => {
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 1),
            )
        })
    })

    describe(CONTRACT_NAME + ' - Metadata', () => {
        const nrUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/notRevealed'
        const baseUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/base'
        const customUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/custom'
        const baseExt = '.json'

        beforeEach(async () => {
            await contract.connect(owner).enableMinting(true)
            await contract
                .connect(addr1)
                .mint(addr1.getAddress(), 1, {
                    value: 0,
                })
        })

        it('notRevealedURI should be empty', async () => {
            expect(await contract.tokenURI(1)).to.equal('')
        })
        it('baseUri should be empty', async () => {
            await contract.connect(owner).reveal(true)
            await contract.connect(owner).setNotRevealedURI(nrUri)
            expect(await contract.tokenURI(1)).to.equal('')
        })
        it('notRevealedURI displayed before reveal', async () => {
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract.connect(owner).setBaseURI(baseUri)
            await contract
                .connect(owner)
                ._setUriForToken(customUri, 1)
            expect(await contract.tokenURI(1)).to.equal(nrUri)
        })
        it('baseUri + baseExt displayed after reveal', async () => {
            await contract.connect(owner).reveal(true)
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract.connect(owner).setBaseURI(baseUri)
            expect(await contract.tokenURI(1)).to.equal(
                baseUri + '1' + baseExt,
            )
        })
        it('customUri displayed if set after reveal', async () => {
            await contract.connect(owner).reveal(true)
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract.connect(owner).setBaseURI(baseUri)
            await contract
                .connect(owner)
                ._setUriForToken(customUri, 1)
            expect(await contract.tokenURI(1)).to.equal(customUri)
        })
    })

    describe(CONTRACT_NAME + ' - Prices', () => {
        it('price_1', async () => {
            expect(await contract.getMintPriceInWei(1)).to.equal(0)
        })
        it('price_20', async () => {
            expect(await contract.getMintPriceInWei(20)).to.equal(0)
        })
    })

    describe(CONTRACT_NAME + ' - Mint', () => {
        beforeEach(async () => {
            await contract.connect(owner).enableMinting(true)
        })
        it('All mint options valid', async () => {
            expect(
                await contract
                    .connect(addr1)
                    .mint(addr1.getAddress(), 1, {
                        value: 0,
                    }),
            )
            expect(
                await contract
                    .connect(addr1)
                    .mint(addr1.getAddress(), 20, {
                        value: 0,
                    }),
            )
        })

        it(REVERT_TAG + 'Invalid mint option', async () => {
            expect(
                await contract
                    .connect(addr1)
                    .mint(addr1.getAddress(), 22, {
                        value: 0,
                    }),
            ).to.be.revertedWith('Invalid mint option.')
        })
        // it(REVERT_TAG + "Not enough ETH", async () => {
        //   expect(await contract.connect(addr1).mint(addr1.getAddress(), 19, {
        //     value: 0
        //   })).to.be.revertedWith("Not enough ETH");
        // });
    })

    describe(CONTRACT_NAME + ' - Disable', () => {
        it(REVERT_TAG + 'Mint reverts after disable', async () => {
            await contract.connect(owner).enableMinting(true)
            await contract.connect(owner).enableMinting(false)
            expect(
                await contract
                    .connect(addr1)
                    .mint(addr1.getAddress(), 5, {
                        value: 0,
                    }),
            ).to.be.revertedWith('Minting not enabled')
        })

        it('Freemint works after disable', async () => {
            await contract.connect(owner).enableMinting(true)
            await contract.connect(owner).enableMinting(false)
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 20),
            )
        })
    })

    describe(CONTRACT_NAME + ' - FreeMint', () => {
        it('All mint options valid', async () => {
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 1),
            )
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 3),
            )
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 5),
            )
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 10),
            )
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 20),
            )
        })

        it('Owner can freeMint to themself', async () => {
            expect(
                await contract
                    .connect(owner)
                    .freeMint(owner.getAddress(), 1),
            )
        })

        it(REVERT_TAG + 'Invalid mint option', async () => {
            expect(
                await contract
                    .connect(owner)
                    .freeMint(addr1.getAddress(), 22),
            ).to.be.revertedWith('Invalid mint option.')
        })
    })

    describe(CONTRACT_NAME + ' - Withdraw', () => {
        it('Owner can withdraw 0', async () => {
            expect(await contract.connect(owner).withdraw())
        })
        it('Owner can withdraw non-0 amount', async () => {
            await contract.connect(owner).enableMinting(true)
            await contract
                .connect(addr1)
                .mint(addr1.getAddress(), 20, {
                    value: 0,
                })
            expect(await contract.connect(owner).withdraw())
        })
    })

    describe(CONTRACT_NAME + ' - EndMint', () => {
        beforeEach(async () => {
            await contract.connect(owner).enableMinting(true)
        })
        it('Can mint FINAL nft successfully', async () => {
            for (let i = 0; i < 5; i++) {
                expect(
                    await contract
                        .connect(owner)
                        .freeMint(addr1.getAddress(), 20),
                )
            }
        })

        it(REVERT_TAG + "Can't mint FINAL + 1 NFTs", async () => {
            for (let i = 0; i < 5; i++) {
                expect(
                    await contract
                        .connect(owner)
                        .freeMint(addr1.getAddress(), 20),
                )
            }
            expect(
                await contract
                    .connect(owner)
                    .mint(addr1.getAddress(), 1),
            )
        })
    })
})
