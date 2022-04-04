// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract ControllableERC20 is ERC20, ReentrancyGuard, Ownable {
    // a mapping from an address to whether or not it can mint / burn
    mapping(address => bool) private ctrl;

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        ctrl[_msgSender()] = true;
    }

    // Mint amount of token to specified address
    function mint(address _to, uint256 _amt) external nonReentrant {
        require(ctrl[msg.sender], 'Only controllers can mint');
        _mint(_to, _amt);
    }

    // Removes token from specified address
    function burn(address _from, uint256 _amt) external nonReentrant {
        require(ctrl[msg.sender], 'Only controllers can burn');
        _burn(_from, _amt);
    }

    function addController(address _addr) external onlyOwner {
        ctrl[_addr] = true;
    }

    function removeController(address _addr) external onlyOwner {
        ctrl[_addr] = false;
    }
}
