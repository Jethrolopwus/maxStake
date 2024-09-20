
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { string } from "hardhat/internal/core/params/argumentTypes";

describe("maxStake", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
   
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    // ethers.getSigners() returns 20 account addresses
    //unpack the first two accounts and save accordingly
    const [tokenOwner, otherAccount] = await hre.ethers.getSigners();

    //get contract to deploy
    const erc20Token = await hre.ethers.getContractFactory("MyToken");
    const myToken = await erc20Token.deploy();

  //   by default, it implicitly deploys with the first account
  //   you can explicitly deploy by specifing account address to use

  //   const token = await erc20Token.connect(otherAccount).deploy();

    return { myToken, tokenOwner };
  }

  async function deployMaxStake() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const { myToken } = await loadFixture(deployToken)

    const maxStakeContract = await hre.ethers.getContractFactory("maxStake");
    const maxStake = await maxStakeContract.deploy(myToken);


    return { maxStake, owner, otherAccount, myToken };
  }

  describe("Test for contract deployment and owner", function () {
    it("Should pass if owner is correct", async function () {
      const { maxStake, owner, otherAccount} = await loadFixture(deployMaxStake); 
      owner: string;
      otherAccount: string;



      expect(await maxStake.owner()).to.equal(owner);
    });

    it("Should fail if owner is incorrect", async function () {
      const { maxStake, owner, otherAccount  } = await loadFixture(deployMaxStake);

      expect(await maxStake.owner()).to.not.eq(otherAccount);
    });
    
  });

  describe("Test stake function", function () {
    it("Should revert with 'invalid pool' if wrong poolId is passed as argument" , async function () {
      const { maxStake, owner, otherAccount  } = await loadFixture(deployMaxStake);

      await expect(maxStake.stake(1000, 4)).to.be.revertedWith("invalid pool")
    });

    it("Should pass if all parameters are set correctly" , async function () {
      // deploy contracts
      const { maxStake, owner, otherAccount, myToken } = await loadFixture(deployMaxStake);


      // expect balance of otherAccount to be zero
      expect(await myToken.balanceOf(otherAccount)).to.equal(0);

      const amountTransferred = 1000;


      // Transfer to user (await the transfer)
      await myToken.transfer(otherAccount.address, amountTransferred);

      // expect balance of otherAccount to be eqaul to new amount transferred
      expect(await myToken.balanceOf(otherAccount)).to.equal(amountTransferred);

      // Approve maxStake contract to spend otherAccount's tokens
      await myToken.connect(otherAccount).approve(maxStake.target, amountTransferred);

      // Check that the staking contract has allowance
      // expect(await maxToken.allowance(otherAccount.address, maxStake.target)).to.equal(amountTransferred);


      const stakedAmount = 500;
      const poolId = 0;

      // //ACT
      await expect(maxStake.connect(otherAccount).stake(stakedAmount, poolId)).to.emit(maxStake, 'Staked').withArgs(otherAccount.address, stakedAmount, poolId);
    })
})

})