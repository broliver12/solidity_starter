// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import './../ERC20/OwnableERC20.sol';

contract Bank {
    mapping(address => uint256) public accounts;

    constructor() {}

    function totalAssets() external view returns (uint256) {
        return address(this).balance;
    }

    function deposit() external payable {
        require(msg.value > 0, 'Must deposit more than 0!');
        accounts[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amount, address _tokenContractAddress) external {
        require(_amount <= accounts[msg.sender], 'Cant withdraw that much');

        accounts[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        OwnableERC20 token = OwnableERC20(_tokenContractAddress);
        token.mint(msg.sender, 1 ether);
    }
}
