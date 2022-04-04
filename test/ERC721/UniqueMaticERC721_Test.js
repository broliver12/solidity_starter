const {
  expect
} = require("chai");
const fs = require("fs");

// Name of test suite
describe("", () => {
  // Set these to the contract's name, and path relative to [basePath]
  const CONTRACT_NAME = "UniqueMaticERC721";
  const CONTRACT_PATH = "ERC721/custom";
  let factory, contract, owner, addr1, addr2;
  let addrs;
  const REVERT_TAG = "REVERT_EXPECTED: ";
  const basePath = "./build/artifacts/solidity/";
  const extension = ".json";
  const fullArtifactPath = `${basePath}${CONTRACT_PATH}/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`;
  const contractFileData = fs.readFileSync(fullArtifactPath);
  const COMPILED_CONTRACT = JSON.parse(contractFileData);
  const priceNum = ethers.utils.parseEther('0.2')

  // Runs before each test
  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    factory = await ethers.getContractFactory(COMPILED_CONTRACT.abi, COMPILED_CONTRACT.bytecode, owner);
    // Pass in desired constructor arguments here
    contract = await factory.deploy("TestName", "TEST");
    await contract.deployTransaction.wait();
  });

  // A test that should pass
  describe(CONTRACT_NAME + ' - Deployment', () => {
      it('Should have no limit', async () => {
          expect(await contract.isLimited()).to.equal(
              false,
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

  // A test that should pass
  describe(CONTRACT_NAME + ' - MintLimit', () => {
      beforeEach(async () => {
          await contract.connect(owner).setIsLimited(true, 5);
      });
      it('Should have a limit, limit is correct', async () => {
          expect(await contract.isLimited()).to.equal(
              true,
          )
          expect(await contract.currentSupplyLimit()).to.equal(
              5,
          )
      });
      it('Can free mint 5', async () => {
          expect(
              await contract
                  .connect(owner)
                  .freeMint(addr1.getAddress(), 5),
          )
      })

      it(`${REVERT_TAG}: Cant free mint 6 `, async () => {
          expect(
              await contract
                  .connect(owner)
                  .freeMint(addr1.getAddress(), 6),
          )
      })

      it(`Can increase limit after it's hit`, async () => {
        expect(
            await contract
                .connect(owner)
                .freeMint(addr1.getAddress(), 5),
        )
        await contract.connect(owner).setIsLimited(true, 6);
        expect(
            await contract
                .connect(owner)
                .freeMint(addr1.getAddress(), 1),
        )
      })

      it(`Can set limit to below current`, async () => {
        expect(
            await contract
                .connect(owner)
                .freeMint(addr1.getAddress(), 5),
        )
        await contract.connect(owner).setIsLimited(true, 2);
      })

      it(`${REVERT_TAG}: Cant mint after set below current`, async () => {
        expect(
            await contract
                .connect(owner)
                .freeMint(addr1.getAddress(), 5),
        )
        await contract.connect(owner).setIsLimited(true, 2);
        expect(
            await contract
                .connect(owner)
                .freeMint(addr1.getAddress(), 1),
        )
      })
  })

  describe(CONTRACT_NAME + ' - Mint', () => {
      beforeEach(async () => {
          await contract.connect(owner).enableMinting(true);
          await contract.connect(owner).setPrice(priceNum);
      });
      it('Non-owner can mint one', async () => {
          expect(await contract.connect(addr1).mint({value: priceNum}))
      });
    });


    describe(CONTRACT_NAME + ' - Metadata', () => {
        const nrUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/notRevealed'
        const customUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/custom'

        beforeEach(async () => {
            await contract.connect(owner).enableMinting(true)
            await contract
                .connect(addr1)
                .mint({
                    value: priceNum,
                })
        })

        it('notRevealedURI should be empty', async () => {
            expect(await contract.tokenURI(1)).to.equal('')
        })
        it('unset custom uri shows base URI', async () => {
            await contract.connect(owner).reveal(true, [1])
            await contract.connect(owner).setNotRevealedURI(nrUri)
            expect(await contract.tokenURI(1)).to.equal(nrUri)
        })
        it('notRevealedURI displayed before reveal', async () => {
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract
                .connect(owner)
                .setUriForToken(customUri, 1)
            expect(await contract.tokenURI(1)).to.equal(nrUri)
        })
        it('customUri displayed if set after reveal', async () => {
            await contract.connect(owner).reveal(true, [1])
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract
                .connect(owner)
                .setUriForToken(customUri, 1)
            expect(await contract.tokenURI(1)).to.equal(customUri)
        })
    })

});
