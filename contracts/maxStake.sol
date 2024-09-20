//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyToken.sol";
import "./interface/IERC20.sol";
import "hardhat/console.sol";

contract maxStake {

    address public owner;
    IERC20 public myToken;
    uint8 constant numberOfTokensPerReward = 25;

    struct Stake {
        uint256 amountStaked;
        uint256 stakedAt;
        uint256 finishesAt;
        uint8 nftReward;
        Pools poolType;
        bool claimed;
    }

    mapping(address => Stake) public stakes;

    enum Pools { oneWeekPool, twoWeeksPool, threeWeeksPool }

    error TimeHasNotFinished();

    // Events to track staking actions
    event Staked(address indexed user, uint256 amount, uint8 poolId);
    event RewardClaimed(address indexed user, uint8 nft, bool convertTokenToNft);

    constructor (address _tkenAddress) {
        owner = msg.sender;
        myToken = IERC20(_tkenAddress);
    }

    function stake(uint _amount, uint8 _poolId) external {
        require(_poolId <= 2, "invalid pool");
        require(myToken.balanceOf(msg.sender) > _amount, "insufficient tokens");

        myToken.transferFrom(msg.sender, address(this), _amount);

        uint8[3] memory nftForPool = [1,2,3];
        uint256[3] memory duration;
        duration[0] = block.timestamp + (7 * 24 * 60 * 60); // 1 week
        duration[1] =  block.timestamp + (14 * 24 * 60 * 60); // 2 weeks
        duration[2] =    block.timestamp + (21 * 24 * 60 * 60); // 3 weeks


        uint8 numberOfNft = nftForPool[_poolId];
        uint256 _finishesAt = duration[_poolId];
        Pools _poolType = Pools(_poolId);

        stakes[msg.sender] = Stake({
            amountStaked: _amount,
            stakedAt: block.timestamp,
            finishesAt: _finishesAt,
            nftReward: numberOfNft,
            claimed: false,
            poolType: _poolType
        });

        emit Staked(msg.sender, _amount, _poolId);
    }
}