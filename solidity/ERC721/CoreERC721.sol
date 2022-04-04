// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/
pragma solidity ^0.8.11;

import '@openzeppelin/contracts/utils/Counters.sol';
import './OwnableERC721.sol';

/****************************************************************************
/* Core ERC721 Contract.
/* Functionality:
/*   - Ownership
/*   - Withdraw
/*   - Enable/Disable minting
/*   - Metadata control:
/*      - Pre reveal URI
/*      - Base URI
/*      - Override URI for token (1-to-1 upgrade)
/*   - Max Supply
/*   - Free mint (still pay gas) for owner
****************************************************************************/
contract CoreERC721 is OwnableERC721 {
    // Counter used to reduce supply, and increase IDs
    using Counters for Counters.Counter;
    Counters.Counter private idCounter;

    function current() internal view returns (uint256) {
        return idCounter.current();
    }

    // Total Supply for entire mint. Ensures that no matter what, only totalSupply NFTs are minted.
    // Can only be set in constructor. If an invalid value is provided, defaults to 10000.
    // Note: This is a limited mint contract.
    // If you want the option to mint unlimited NFTs from your contract, use UnlimitedERC721.sol
    uint256 public totalSupply = 10000;

    // Action control variables
    bool public mintingEnabled;

    // Metadata control variables
    bool private revealed;
    string private baseURI;
    string private notRevealedURI;
    string private baseExtension = '.json';
    mapping(uint256 => string) private _customizedUris;

    // Override this to implement custom mint option logic
    function validMintOption(uint256 mintOption) internal pure virtual returns (bool) {
        if (mintOption <= 20) {
            return true;
        }
        return false;
    }

    // Override this to implement custom price logic
    function getPrice(uint256 quantity) internal view virtual returns (uint256) {
        return 0;
    }

    // Constructor - Creates the ERC721 contract
    // Arguments: NFT name, NFT symbol, max supply
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply
    ) OwnableERC721(_name, _symbol) {
        if (_maxSupply > 0 && _maxSupply <= 1000000) totalSupply = _maxSupply;
    }

    // Checks that the inputs meet the requirements
    // Mints the specified number of NFTs, and sends them to the recipient
    function mint(address recipient, uint256 mintOption) public payable virtual {
        require(validMintOption(mintOption), 'Illegal quantity.');
        require(mintingEnabled, 'Minting not enabled.');
        require(msg.value >= getPrice(mintOption), 'Not enough ETH.');
        require(checkRemainingSupply() >= mintOption, 'Not enough remainging supply.');

        uint256 newItemId;

        for (uint256 i = 0; i < mintOption; i++) {
            idCounter.increment();
            newItemId = idCounter.current();
            _safeMint(recipient, newItemId);
        }
    }

    // Override virtual tokenURI() function; enable baseURI, notRevealedURI, and overwriting for 1-to-1s
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), 'URI query for nonexistent token');

        if (revealed == false) {
            return notRevealedURI;
        }

        if (compareStrings(_customizedUris[tokenId], '') == false) {
            return _customizedUris[tokenId];
        }

        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, Strings.toString(tokenId), baseExtension))
                : '';
    }

    // Returns the price for the requested mintOption in wei
    function getMintPriceInWei(uint256 mintOption) external view returns (uint256) {
        require(validMintOption(mintOption), 'Illegal quantity.');
        require(checkRemainingSupply() >= mintOption, 'Not enough remainging supply.');
        return getPrice(mintOption);
    }

    // Check remaining mint supplypublic
    function checkRemainingSupply() public view returns (uint256) {
        return totalSupply - idCounter.current();
    }

    // Sets token uri to whatever is passed in.
    function _setUriForToken(string memory _tokenURI, uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), 'URIset of nonexistent token');
        _customizedUris[tokenId] = _tokenURI;
    }

    // Set revealed to true (displays baseURI instead of notRevealedURI on metamask/opensea)
    function reveal(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }

    /*Change token URIs if something fatal happens to initial URIs*/
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedURI = _notRevealedURI;
    }

    // Enables or disables minting
    function enableMinting(bool _enabled) public onlyOwner {
        mintingEnabled = _enabled;
    }

    // Allows the owner to mint NFTs for free to the specified recipient.
    // Owner still pays gas (obviously)
    // Used for giveaways.
    // NFTs minted through this method are still subtracted from the total supply..
    function freeMint(address recipient, uint256 mintOption) external onlyOwner {
        require(validMintOption(mintOption), 'Illegal quantity.');
        require(checkRemainingSupply() >= mintOption, 'Not enough remainging supply.');
        for (uint256 i = 0; i < mintOption; i++) {
            idCounter.increment();
            _safeMint(recipient, idCounter.current());
        }
    }
}
