// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

import './OwnableERC721.sol';
import './../other/MetaTransactionContext.sol';

/****************************************************************************/
/* Extend this contract instead of OwnableERC721 when deploying NFT         */
/* projects to Polygon (or her testnets) that will be listed on OpenSea     */
/****************************************************************************/
contract OpenSeaMaticERC721 is OwnableERC721, MetaTransactionContext {
    constructor(string memory _name, string memory _symbol) OwnableERC721(_name, _symbol) {}

    function isApprovedForAll(address _owner, address _operator)
        public
        view
        override
        returns (bool isOperator)
    {
        if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
            return true;
        }
        return ERC721.isApprovedForAll(_owner, _operator);
    }

    function _msgSender() internal view override returns (address sender) {
        return MetaTransactionContext.msgSender();
    }
}
