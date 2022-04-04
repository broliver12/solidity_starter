// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.2

/****************************************************************************
    Written by Oliver Straszynski
    https://github.com/broliver12/
****************************************************************************/

pragma solidity ^0.8.4;

import './CoreERC721A.sol';

contract WhitelistERC721A is CoreERC721A {

    bool public whitelistEnabled;
    uint256 public maxMintsWhitelist = 3;
    mapping(address => uint256) public whitelist;

    constructor(
      string memory name_,
      string memory symbol_
    ) CoreERC721A(
      name_,
      symbol_
    ) {}

    // Mint function for whitelist sale
    // Requires minimum ETH value of unitPrice * quantity
    // Caller MUST be whitelisted to use this function!
    function whitelistMint(uint256 quantity) external payable isWallet enoughSupply(quantity) {
        require(whitelistEnabled, 'Whitelist sale not enabled');
        require(msg.value >= quantity * unitPrice, 'Not enough ETH');
        require(whitelist[msg.sender] >= quantity, 'No whitelist mints left');
        whitelist[msg.sender] = whitelist[msg.sender] - quantity;
        _safeMint(msg.sender, quantity);
        refundIfOver(quantity * unitPrice);
    }

    // Set the mint state
    function setMintState(uint256 _state) external virtual override onlyOwner {
        if (_state == 1) {
            whitelistEnabled = true;
        } else if (_state == 2) {
            publicMintEnabled = true;
        } else {
            whitelistEnabled = false;
            publicMintEnabled = false;
        }
    }

    // Seed the appropriate whitelist
    function setWhitelist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            whitelist[addrs[i]] = maxMintsWhitelist;
        }
    }
}
