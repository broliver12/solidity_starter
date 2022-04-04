// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/****************************************************************************
/* Base ERC721 Contract.
/* Functionality:
/*   - Ownership
/*   - Withdraw
****************************************************************************/
contract OwnableERC721 is ERC721, Ownable {
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    // Safe withdraw method, minimizes gas cost for contract value transfer
    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}('');
        require(os, 'Withdraw failed.');
    }

    // Add virtual keyword so that we can override this function
    // to enable meta-transactions, but don't change functionality.
    function _msgSender() internal view virtual override returns (address sender) {
        super._msgSender();
    }

    // Internal helper to compare 2 strings
    // Used for 1-to-1 customization, and other string comparison functionality.
    // If you're optimizing, and want to remove this, copy the file and remove it in the copy.
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
