// SPDX-License-Identifier: MIT

/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/****************************************************************************/

pragma solidity ^0.8.11;

contract RandomUtil {
    // Psuedorandom value, provide different seeds for different blocks!
    function random(uint256 seed) public view virtual returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(tx.origin, blockhash(block.number - 1), block.timestamp, seed)
                )
            );
    }
}
