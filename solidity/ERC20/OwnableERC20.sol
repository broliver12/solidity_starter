// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract OwnableERC20 is ERC20, Ownable {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

    // Mint amount of token to specified address
    function mint(address _to, uint256 _amt) external onlyOwner {
        _mint(_to, _amt);
    }

    // Removes token from specified address
    function burn(address _from, uint256 _amt) external onlyOwner {
        _burn(_from, _amt);
    }
}
