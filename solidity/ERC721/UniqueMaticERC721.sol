// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import '@openzeppelin/contracts/utils/Counters.sol';
import './OpenSeaMaticERC721.sol';

/****************************************************************************
/* Only use this contract on Polygon & Testnets
/* Do not deploy this contract on Ethereum or testnets.
/*
/* Functionality:
/*   - Ownership
/*   - Withdraw
/*   - Enable/Disable minting
/*   - Modifiable/removable limit
/*   - Metadata control:
/*      - Pre reveal URI
/*      - Individual reveal
/*      - Batch mint with optional batch reveal
/*      - Override URI for token (1-to-1 upgrade)
/*   - Free mint (still pay gas) for owner
****************************************************************************/
contract UniqueMaticERC721 is OpenSeaMaticERC721 {
    constructor(string memory _name, string memory _symbol) OpenSeaMaticERC721(_name, _symbol) {}

    using Counters for Counters.Counter;
    Counters.Counter private idCounter;

    bool public mintingEnabled;
    uint256 public price;

    string private notRevealedURI;
    // Control reveal and tokenURI individually
    mapping(uint256 => bool) private revealedState;
    mapping(uint256 => string) private customizedUris;

    uint256 public maxPossibleSupply = 1000000;
    uint256 public maxBatchMint = 20;
    bool public isLimited;
    uint256 public currentSupplyLimit;

    function checkAmountMinted() public view returns (uint256) {
        return idCounter.current();
    }

    // Sets token uri to whatever is passed in.
    function setUriForToken(string memory _tokenURI, uint256 _tokenId) external onlyOwner {
        require(_exists(_tokenId), 'URIset for nonexistent token');
        customizedUris[_tokenId] = _tokenURI;
    }

    function hasSufficientSupply(uint256 _quantity) public view returns (bool) {
        if (idCounter.current() + _quantity > maxPossibleSupply) {
            return false;
        }
        return (!isLimited || currentSupplyLimit >= idCounter.current() + _quantity);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), 'URIquery for nonexistent token');

        if (revealedState[_tokenId] != true) {
            return notRevealedURI;
        }

        if (compareStrings(customizedUris[_tokenId], '') == false) {
            return customizedUris[_tokenId];
        }

        return notRevealedURI;
    }

    // Set revealed to true (displays baseURI instead of notRevealedURI on metamask/opensea)
    function reveal(bool _revealed, uint256[] calldata _ids) external onlyOwner {
        for (uint256 i = 0; i < _ids.length; i++) {
            revealedState[_ids[i]] = _revealed;
        }
    }

    // Enables or disables minting
    function enableMinting(bool _enabled) external onlyOwner {
        mintingEnabled = _enabled;
    }

    function setPrice(uint256 _price) external onlyOwner {
        require(price >= 0, 'Price cant be negative.');
        price = _price;
    }

    function mint() external payable {
        require(msg.value >= price, 'Not enough ETH.');
        require(hasSufficientSupply(1) == true, 'Not enough remainging supply.');
        idCounter.increment();
        _safeMint(_msgSender(), idCounter.current());
    }

    function setNotRevealedURI(string memory _notRevealedURI) external onlyOwner {
        notRevealedURI = _notRevealedURI;
    }

    function setIsLimited(bool _limited, uint256 _limit) public onlyOwner {
        require(_limit < maxPossibleSupply, 'Max possible supply is 1M.');
        if (_limited == true) {
            if (_limit > idCounter.current()) {
                currentSupplyLimit = _limit;
            } else {
                currentSupplyLimit = idCounter.current();
            }
        }
        isLimited = _limited;
    }

    // Allows the owner to mint NFTs for free to the specified recipient.
    // Owner still pays gas (obviously)
    // Used for giveaways, 1-to-1s and upgrades.
    // Mint options still apply. NFTs minted through this method are subtracted from the total supply
    function freeMint(address recipient, uint256 mintOption) external onlyOwner {
        require(0 <= mintOption && mintOption <= maxBatchMint, 'Invalid mint option.');
        require(hasSufficientSupply(mintOption) == true, 'Not enough remainging supply.');
        for (uint256 i = 0; i < mintOption; i++) {
            idCounter.increment();
            _safeMint(recipient, idCounter.current());
        }
    }
}
