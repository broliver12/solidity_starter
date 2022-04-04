// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.2

/****************************************************************************
    Written by Oliver Straszynski
    https://github.com/broliver12/
****************************************************************************/

pragma solidity ^0.8.4;

import './ERC721A_indexExt.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract CoreERC721A is ERC721A_indexExt, Ownable, ReentrancyGuard {
    // Control Params
    bool private revealed;
    string private baseURI;
    string private notRevealedURI;
    string private baseExtension = '.json';
    bool public publicMintEnabled;
    uint256 public immutable totalDevSupply;
    uint256 public immutable totalCollectionSize;

    // Mint Limits
    uint256 public maxMints = 20;

    // Price
    uint256 public unitPrice = 0.02 ether;

    // TOTAL supply for devs, marketing, friends, family
    uint256 private remainingDevSupply = 55;

    constructor(
      string memory name_,
      string memory symbol_
    ) ERC721A_indexExt(
      name_,
      symbol_
    ) {
        // Set collection size
        totalCollectionSize = 5555;
        // Set dev supply
        totalDevSupply = remainingDevSupply;
    }

    // Ensure caller is a wallet
    modifier isWallet() {
        require(tx.origin == msg.sender, 'Cant be a contract');
        _;
    }

    // Ensure there's enough supply to mint the quantity
    modifier enoughSupply(uint256 quantity) {
        require(totalSupply() + quantity <= totalCollectionSize, 'reached max supply');
        _;
    }

    // Mint function for public sale
    // Requires minimum ETH value of unitPrice * quantity
    function publicMint(uint256 quantity)
        external
        payable
        isWallet
        enoughSupply(quantity)
    {
        require(publicMintEnabled, 'Minting not enabled');
        require(quantity <= maxMints, 'Illegal quantity');
        require(numberMinted(msg.sender) + quantity <= maxMints, 'Cant mint that many');
        require(msg.value >= quantity * unitPrice, 'Not enough ETH');
        _safeMint(msg.sender, quantity);
        refundIfOver(quantity * unitPrice);
    }

    // Mint function for developers (owner)
    // Mints a maximum of 20 NFTs to the recipient
    // Used for devs, marketing, friends, family
    // Capped at 55 mints total
    function devMint(uint256 quantity, address recipient)
        external
        onlyOwner
        enoughSupply(quantity)
    {
        require(remainingDevSupply - quantity >= 0, 'Not enough dev supply');
        require(quantity <= maxMints, 'Illegal quantity');
        require(numberMinted(recipient) + quantity <= maxMints, 'Cant mint that many (dev)');
        remainingDevSupply = remainingDevSupply - quantity;
        _safeMint(recipient, quantity);
    }

    // Returns the correct URI for the given tokenId based on contract state
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'Nonexistent token');
        if(!revealed){
          return notRevealedURI;
        }
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), baseExtension))
                : '';
    }

    // Set Price for Public Mint.
    function setPrice(uint256 _price) external onlyOwner {
        unitPrice = _price;
    }

    // Change base metadata URI
    // Only will be called if something fatal happens to initial base URI
    function setBaseURI(string calldata _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    // Only will be called if something fatal happens to initial base URI
    function setBaseExtension(string calldata _baseExtension) external onlyOwner {
        baseExtension = _baseExtension;
    }

    // Sets URI for pre-reveal art metadata
    function setNotRevealedURI(string calldata _notRevealedURI) external onlyOwner {
        notRevealedURI = _notRevealedURI;
    }

    // Set the mint state
    function setMintState(uint256 _state) external virtual onlyOwner {
        if (_state == 1) {
          publicMintEnabled = true;
        } else {
          publicMintEnabled = false;
        }
    }

    // Set revealed to true (displays baseURI instead of notRevealedURI on opensea)
    function reveal(bool _revealed) external onlyOwner {
        revealed = _revealed;
    }

    // Returns the amount the address has minted
    function numberMinted(address minterAddr) public view returns (uint256) {
        return _numberMinted(minterAddr);
    }

    // Returns the ownership data for the given tokenId
    function getOwnershipData(uint256 tokenId) external view returns (TokenOwnership memory) {
        return _ownershipOf(tokenId);
    }

    // Withdraw entire contract value to owners wallet
    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}('');
        require(success, 'Withdraw failed');
    }

    // Refunds extra ETH if minter sends too much
    function refundIfOver(uint256 price) internal {
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
}
