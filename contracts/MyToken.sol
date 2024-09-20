// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "./ERC20/ERC20.sol";

contract MyToken is ERC20{
    address public owner;

    constructor()
        ERC20("MyToken", "MTK")
    {
        owner = msg.sender;
        _mint(owner, 10000e18);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not the owner");
        _;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
